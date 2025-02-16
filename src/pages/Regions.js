import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faPlus,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

import Logo from "../components/Logo";
import LanguageSelector from "../components/LanguageSelector";
import ActionsBar from "../components/ActionsBar";
import Messages from "../components/Messages";

import { apiService } from "../services/apiService";
import { useAuth } from "../AuthContext";

const Regions = () => {
  const { t } = useTranslation();
  const [regions, setRegions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingRegion, setEditingRegion] = useState(null);
  const [newRegionName, setNewRegionName] = useState("");
  const { user } = useAuth();

  // Fetch regions and user role
  useEffect(() => {
    const fetchRegions = async () => {
      if (!user) return;
      try {
        console.log("Loading current user...");
        const userResponse = await apiService.getUserById(user.uid);
        setIsAdmin(userResponse.data.data.role === "Admin");
        console.log("Loading regions...");
        const regionsResponse = await apiService.getRegions();
        console.log(regionsResponse.data);
        setRegions(
          regionsResponse.data.sort((a, b) => a.name.localeCompare(b.name))
        );
        console.log("Regions loaded");
      } catch (err) {
        setError(t("failedToLoadData"));
      }
    };

    fetchRegions();
  }, [user]);

  // Handle edit
  const handleEdit = (id, name) => {
    setEditingRegion({ id, name });
  };

  // Handle save
  const handleSave = async (id) => {
    try {
      await apiService.updateRegion(id, { name: editingRegion.name });
      setRegions(
        regions.map((region) =>
          region.id === id ? { ...region, name: editingRegion.name } : region
        )
      );
      setEditingRegion(null);
      setSuccess(t("regionUpdated"));
    } catch (err) {
      setError(t("failedToUpdateRegion"));
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await apiService.deleteRegion(id);
      setRegions(regions.filter((region) => region.id !== id));
      setSuccess(t("regionDeleted"));
    } catch (err) {
      setSuccess("");
      setError(t("failedToDeleteRegion"));
    }
  };

  // Handle add new region
  const handleAdd = async () => {
    if (!newRegionName.trim()) {
      setError(t("regionNameRequired"));
      return;
    }
    try {
      const response = await apiService.addRegion({ name: newRegionName });
      setRegions(
        [...regions, response.data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewRegionName("");
      setSuccess(t("regionAdded"));
    } catch (err) {
      setError(t("failedToAddRegion"));
    }
  };

  const handleSendNotification = async (region) => {
    try {
      console.log(region.id);
      await apiService.sendNotificationForRegion(region.id); // Call backend API to send notifications
      setSuccess(t("notificationSent") + region.name);
    } catch (err) {
      setError(t("failedToSendNotification" + region.name));
    }
  };

  return (
    <div className="container">
      <Logo />
      <LanguageSelector />
      <ActionsBar />
      <h1>{t("regions")}</h1>
      <Messages error={error} success={success} />
      <table>
        <thead>
          <tr>
            {isAdmin && <th>{t("notifyUsers")}</th>}
            <th>{t("regionName")}</th>
            {isAdmin && <th>{t("actions")}</th>}
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => (
            <tr key={region.id}>
              {isAdmin && (
                <td>
                  <button
                    onClick={() => handleSendNotification(region)}
                    title={t("notifyUsers")}
                  >
                    <FontAwesomeIcon icon={faEnvelope} />
                  </button>
                </td>
              )}
              <td>
                {editingRegion?.id === region.id ? (
                  <input
                    type="text"
                    value={editingRegion.name}
                    onChange={(e) =>
                      setEditingRegion({
                        ...editingRegion,
                        name: e.target.value,
                      })
                    }
                  />
                ) : (
                  region.name
                )}
              </td>
              {isAdmin && (
                <td>
                  {editingRegion?.id === region.id ? (
                    <>
                      <button
                        onClick={() => handleSave(region.id)}
                        title={t("save")}
                      >
                        <FontAwesomeIcon icon={faSave} />
                      </button>
                      <button
                        onClick={() => setEditingRegion(null)}
                        title={t("cancel")}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(region.id, region.name)}
                        title={t("edit")}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(region.id)}
                        title={t("delete")}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
          {isAdmin && (
            <tr>
              <td></td>
              <td>
                <input
                  type="text"
                  value={newRegionName}
                  placeholder={t("newRegionName")}
                  onChange={(e) => setNewRegionName(e.target.value)}
                />
              </td>
              <td>
                <button onClick={handleAdd} title={t("add")}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>{" "}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Regions;
