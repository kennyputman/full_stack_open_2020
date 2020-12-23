import React from "react";

const LoginForm = ({
  username,
  password,
  handleLogin,
  setUsername,
  setPassword,
}) => {
  return (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          type="text"
          value={username}
          name="Username"
          onChange={setUsername}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          name="Password"
          onChange={setPassword}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );
};

export default LoginForm;