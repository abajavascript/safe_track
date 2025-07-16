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
  faEnvelope,
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
  const [regions, setRegions] = useState([]);
  const [managers, setManagers] = useState([]);
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

  const fetchRegions = async () => {
    try {
      if (!user) return;
      const regionsResponse = await apiService.getRegions();
      setRegions(regionsResponse.data);
    } catch (err) {
      setError(t("failedToLoadData"));
    }
  };

  const fetchManagers = async () => {
    try {
      if (!user) return;
      const managersResponse = await apiService.getManagers();
      setManagers(managersResponse.data);
    } catch (err) {
      setError(t("failedToLoadData"));
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRegions();
    fetchManagers();
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
                title={"In danger\n" + user.lastResponse.safety_comment}
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
        <div style={{ marginLeft: "10px", maxWidth: "200px" }}>
          <div>? {formatDate(user.lastRequest?.createdAt)}</div>
          <div>
            &gt;{" "}
            {user.lastResponse?.response_date_time > user.lastRequest?.createdAt
              ? formatDate(user.lastResponse?.response_date_time)
              : " "}
          </div>

          {user.lastResponse &&
          new Date(user.lastResponse.response_date_time) >
            new Date(user.lastRequest?.createdAt) &&
          user.lastResponse.safety_status !== "Yes" ? (
            <div>{user.lastResponse?.safety_comment}</div>
          ) : (
            " "
          )}
        </div>
      </>
    );
  };

  // Handle edit
  const handleEditUser = (uid, role, region, manager_uid, manager_name) => {
    setEditingUser({ uid, role, region, manager_uid, manager_name });
  };

  // Handle save user fields
  const handleSaveUser = async (uid) => {
    try {
      // await apiService.updateUserRole(uid, editingUser.role);
      await apiService.updateUserFields(uid, {
        role: editingUser.role,
        region: editingUser.region,
        manager_uid: editingUser.manager_uid,
        manager_name: editingUser.manager_name,
      });
      setUsers(
        users.map((user) =>
          user.uid === uid
            ? {
                ...user,
                role: editingUser.role,
                region: editingUser.region,
                manager_uid: editingUser.manager_uid,
                manager_name: editingUser.manager_name,
              }
            : user
        )
      );
      setEditingUser(null);
      setSuccess(t("userFieldsUpdated"));
    } catch (err) {
      setError(t("failedToUpdateUserFields"));
    }
  };

  // Handle verify user email
  const handleVerifyEmail = async (uid) => {
    try {
      await apiService.verifyEmail(uid);
      setUsers(
        users.map((user) =>
          user.uid === uid
            ? { ...user, status: "Verified", emailVerified: true }
            : user
        )
      );
      setSuccess(t("emailVerifiedByAdmin"));
    } catch (err) {
      setError(t("failedToVerifyEmailByAdmin"));
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

  const handleSendNotification = async (user) => {
    try {
      console.log(user.uid);
      await apiService.sendNotificationForUser(user.uid); // Call backend API to send notifications
      setSuccess(t("notificationSentToUser") + user.fullName);
    } catch (err) {
      setError(t("failedToSendNotificationToUser") + user.fullName);
    }
  };

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
            {isAdmin && <th>{t("notifyUsers")}</th>}
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
              {isAdmin && (
                <td>
                  <button
                    className="icon-button"
                    onClick={() => handleSendNotification(user)}
                    title={t("notifyUsers")}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                  </button>
                </td>
              )}
              <td data-label={t("fullName")}>{user.fullName || "\u00A0"}</td>
              <td
                data-label={t("status")}
                style={{ display: "flex", alignItems: "center" }}
              >
                {renderUserStatus(user) || "\u00A0"}
              </td>
              <td data-label={t("email")}>{user.email || "\u00A0"}</td>
              <td data-label={t("phone")}>{user.phone || "\u00A0"}</td>
              <td data-label={t("region")}>
                {editingUser?.uid === user.uid ? (
                  <select
                    value={editingUser.region}
                    style={{ fontSize: "16px" }}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, region: e.target.value })
                    }
                  >
                    <option value="">{t("selectRegion")}</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  user.region || "\u00A0"
                )}
              </td>
              <td data-label={t("manager")}>
                {editingUser?.uid === user.uid ? (
                  <select
                    value={editingUser.manager_uid}
                    style={{ fontSize: "16px" }}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        manager_uid: e.target.value,
                        manager_name:
                          e.target.options[e.target.selectedIndex].text,
                      })
                    }
                  >
                    <option value="">{t("selectManager")}</option>
                    {managers.map((manager) => (
                      <option key={manager.uid} value={manager.uid}>
                        {manager.name} {manager.surname}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    {user.manager_name || "\u00A0"}
                    <span style={{ display: "none" }}>{user.manager_uid}</span>
                  </>
                )}
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
                          onClick={() => handleSaveUser(user.uid)}
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
                    ) : "emailVerified" in user ? (
                      <></>
                    ) : (
                      <>
                        {" "}
                        <button
                          className="icon-button"
                          onClick={() =>
                            handleEditUser(
                              user.uid,
                              user.role,
                              user.region,
                              user.manager_uid,
                              user.manager_name
                            )
                          }
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
                {user.status === "Unverified" && (
                  <button
                    className="icon-button"
                    onClick={() => handleVerifyEmail(user.uid)}
                    title={t("verifyEmail")}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                )}
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
