import React, { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { useTranslation } from "react-i18next";
import Logo from "../components/Logo";
import LanguageSelector from "../components/LanguageSelector";
import Messages from "../components/Messages";
import ActionsBar from "../components/ActionsBar";
import { auth } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faTrash,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const UsersList = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users and current user's role
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userResponse = await apiService.getUserById(auth.currentUser.uid);
        setIsAdmin(userResponse.data.data.role === "Admin");

        const usersResponse = await apiService.getUserList();
        usersResponse.data.data.forEach(
          (user) => (user.fullName = user.name + " " + user.surname)
        );
        console.log(usersResponse.data);
        setUsers(
          usersResponse.data.data.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          )
        );
      } catch (err) {
        setError(t("failedToLoadData"));
      }
    };

    fetchUsers();
  }, [t]);

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

  // Handle delete user
  const handleDelete = async (uid) => {
    try {
      await apiService.deleteUser(uid);
      setUsers(users.filter((user) => user.uid !== uid));
      setSuccess(t("userDeleted"));
    } catch (err) {
      setError(t("failedToDeleteUser"));
    }
  };

  return (
    <div className="users-list">
      <Logo />
      <LanguageSelector />
      <ActionsBar />
      <h1>{t("usersList")}</h1>
      <Messages error={error} success={success} />
      <table>
        <thead>
          <tr>
            <th>{t("fullName")}</th>
            <th>{t("email")}</th>
            <th>{t("phone")}</th>
            <th>{t("region")}</th>
            <th>{t("manager")}</th>
            <th>{t("role")}</th>
            <th>{t("status")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.region}</td>
              <td>
                {user.manager_name}{" "}
                <span style={{ display: "none" }}>{user.manager_uid}</span>
              </td>
              <td>
                {editingUser && editingUser?.uid === user.uid ? (
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                  >
                    <option value="User">User</option>
                    <option value="Operator">Operator</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  user.role
                )}
                {isAdmin && (
                  <>
                    {editingUser?.uid === user.uid ? (
                      <>
                        <button
                          onClick={() => handleSaveRole(user.uid)}
                          title={t("save")}
                        >
                          <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          title={t("cancel")}
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
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
              <td>
                {user.status}
                {user.status === "PendingApproval" && (
                  <>
                    {" "}
                    <button
                      onClick={() => handleApprove(user.uid)}
                      title={t("approve")}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>{" "}
                    <button
                      onClick={() => handleDelete(user.uid)}
                      title={t("delete")}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                )}
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
