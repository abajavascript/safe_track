import React from "react";

const Messages = ({ error, success }) => (
  <div className="messages">
    {error && <p style={{ color: "red" }}>{error}</p>}
    {success && <p style={{ color: "green" }}>{success}</p>}
  </div>
);

export default Messages;
