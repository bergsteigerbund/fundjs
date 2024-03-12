import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { pb } from "../util";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await pb.collection("users").authWithPassword(username, password);
      console.log(pb.authStore);
      navigate("/admin");
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <>
      <h3 style={{ marginTop: 40, textAlign: "center" }}>
        🌂 SBB Fundsachen 🎒
      </h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Nutzername</label>
        <input
          type="text"
          id="username"
          name="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <label htmlFor="password">Passwort</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" style={{marginTop: 20}}>Login</button>
      </form>
    </>
  );
}

export default Login;
