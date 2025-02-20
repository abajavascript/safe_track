import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faTrash,
  faCheck,
  faTimes,
  faPlus,
  faTimesCircle,
  faClock,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";

import Logo from "../components/Logo";
import LanguageSelector from "../components/LanguageSelector";
import Messages from "../components/Messages";
import ActionsBar from "../components/ActionsBar";

import { apiService } from "../services/apiService";
import { useAuth } from "../AuthContext";

const UsersList = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const { user } = useAuth();

  const fetchUsers = async () => {
    console.log("fetchUsers : entered");
    if (!user) {
      console.log("fetchUsers : user is null");
      return;
    }
    try {
      const userResponse = await apiService.getUserById(user.uid);
      setIsAdmin(userResponse.data.data.role === "Admin");
      const usersResponse = await apiService.getUserList();
      const usersData = usersResponse.data.data.map((user) => ({
        ...user,
        fullName: user.name + " " + user.surname,
      }));

      const usersSorted = usersData.sort((a, b) =>
        a.fullName.localeCompare(b.fullName)
      );
      setUsers(usersSorted);

      const statuses = await apiService.getStatusesForUserId(user.uid);
      const usersWithStatuses = usersSorted.map((user) => {
        const lastRequest = statuses.data.data.lastRequests.find(
          (lastRequest) => lastRequest.uid === user.uid
        );
        const lastResponse = statuses.data.data.lastResponses.find(
          (lastResponse) => lastResponse.user_uid === user.uid
        );
        return {
          ...user,
          lastRequest: lastRequest || { createdAt: new Date() },
          lastResponse: lastResponse,
        };
      });
      console.log("fetchUsers : usersWithStatuses", usersWithStatuses);
      setUsers(usersWithStatuses);
    } catch (err) {
      setError(t("failedToLoadData"));
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  // useEffect(() => {
  //   if (users.length > 0) {
  //     fetchStatuses();
  //   }
  // }, [users]);

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  };

  const renderUserStatus = (user) => {
    if (!user.lastResponse && !user.lastRequest) return null;
    return (
      <>
        {/* <span>? {formatDate(user.lastRequest?.createdAt)}</span>
        <br />
        <span>
          &gt;{" "}
          {user.lastResponse?.response_date_time > user.lastRequest?.createdAt
            ? formatDate(user.lastResponse?.response_date_time)
            : " "}
        </span> */}
        <span>
          {user.lastResponse &&
          new Date(user.lastResponse.response_date_time) >
            new Date(user.lastRequest?.createdAt) ? (
            user.lastResponse.safety_status === "Yes" ? (
              <FontAwesomeIcon
                icon={faPlus}
                style={{
                  color: "green",
                }}
                title="In safe place"
              />
            ) : (
              <FontAwesomeIcon
                icon={faTimesCircle}
                style={{ color: "red" }}
                title="In danger"
              />
            )
          ) : new Date(user.lastRequest?.createdAt) >
            new Date(Date.now() - 3 * 60 * 60 * 1000) ? (
            <FontAwesomeIcon
              icon={faClock}
              style={{ color: "yellow" }}
              title="Waiting for response. Less than 3 hours before request."
            />
          ) : (
            <FontAwesomeIcon
              icon={faExclamationCircle}
              style={{ color: "orange" }}
              title="Response overdue. More than 3 hours waiting for response."
            />
          )}
        </span>
      </>
    );
  };

  // Handle edit
  const handleEdit = (uid, role) => {
    setEditingUser({ uid, role });
  };

  // Handle save role
  const handleSaveRole = async (uid) => {
    try {
      await apiService.updateUserRole(uid, editingUser.role);
      setUsers(
        users.map((user) =>
          user.uid === uid ? { ...user, role: editingUser.role } : user
        )
      );
      setEditingUser(null);
      setSuccess(t("userRoleUpdated"));
    } catch (err) {
      setError(t("failedToUpdateUserRole"));
    }
  };

  // Handle approve user
  const handleApprove = async (uid) => {
    try {
      await apiService.updateUserStatus(uid, "Approved");
      setUsers(
        users.map((user) =>
          user.uid === uid ? { ...user, status: "Approved" } : user
        )
      );
      setSuccess(t("userApproved"));
    } catch (err) {
      setError(t("failedToApproveUser"));
    }
  };

  // Handle delete user with confirmation
  const handleDelete = async (uid) => {
    if (window.confirm(t("confirmDeleteUser"))) {
      try {
        await apiService.deleteUser(uid);
        setUsers(users.filter((user) => user.uid !== uid));
        setSuccess(t("userDeleted"));
      } catch (err) {
        setError(t("failedToDeleteUser"));
      }
    }
  };

  // Sort users by role and then by fullName
  const sortedUsers = users.sort((a, b) => {
    if (a.role === b.role) {
      return a.fullName.localeCompare(b.fullName);
    }
    return a.role.localeCompare(b.role);
  });

  return (
    <div className="users-list">
      <Logo />
      <LanguageSelector />
      <ActionsBar />
      <h1>{t("usersList")}</h1>
      <Messages error={error} success={success} />
      <table className="users-table">
        <thead>
          <tr>
            <th>{t("fullName")}</th>
            <th>{t("status")}</th>
            <th>{t("email")}</th>
            <th>{t("phone")}</th>
            <th>{t("region")}</th>
            <th>{t("manager")}</th>
            <th>{t("role")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.uid}>
              <td data-label={t("fullName")}>{user.fullName || "\u00A0"}</td>
              <td data-label={t("status")}>
                {renderUserStatus(user) || "\u00A0"}
              </td>
              <td data-label={t("email")}>{user.email || "\u00A0"}</td>
              <td data-label={t("phone")}>{user.phone || "\u00A0"}</td>
              <td data-label={t("region")}>{user.region || "\u00A0"}</td>
              <td data-label={t("manager")}>
                {user.manager_name || "\u00A0"}{" "}
                <span style={{ display: "none" }}>{user.manager_uid}</span>
              </td>
              <td data-label={t("role")}>
                {editingUser && editingUser?.uid === user.uid ? (
                  <select
                    value={editingUser.role}
                    style={{ fontSize: "16px" }}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                  >
                    <option value="User">User</option>
                    <option value="Operator">Operator</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  user.role || "\u00A0"
                )}
                {isAdmin && (
                  <>
                    {editingUser?.uid === user.uid ? (
                      <>
                        {" "}
                        <button
                          className="icon-button"
                          onClick={() => handleSaveRole(user.uid)}
                          title={t("save")}
                        >
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => setEditingUser(null)}
                          title={t("cancel")}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </>
                    ) : (
                      <>
                        {" "}
                        <button
                          className="icon-button"
                          onClick={() => handleEdit(user.uid, user.role)}
                          title={t("edit")}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      </>
                    )}
                  </>
                )}
              </td>
              <td data-label={t("actions")}>
                {user.status || "\u00A0"}
                {user.status === "Pending" && (
                  <button
                    className="icon-button"
                    onClick={() => handleApprove(user.uid)}
                    title={t("approve")}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                )}
                <button
                  className="icon-button"
                  onClick={() => handleDelete(user.uid)}
                  title={t("delete")}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
