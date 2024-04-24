import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RecordModel } from "pocketbase";

import { pb } from "../util";
import Item from "../components/Item";

function Admin() {
  // check login
  const navigate = useNavigate();
  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate("/login");
    }
  }, []);

  // form data
  const [start, setStart] = useState(
    new Date(new Date().getTime() - 3 * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  ); // default start date is 3 weeks ago
  const [end, setEnd] = useState(
    new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  ); // default end date is tomorrow
  const [category, setCategory] = useState("");
  const [textSearch, setTextSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("not-picked-up");

  const [items, setItems] = useState<RecordModel[]>([]);

  const fetchItems = async () => {
    let filter = `founddate >= "${start}" && founddate <= "${end}"`;
    if (textSearch) {
      filter += `&& comment ~ "%${textSearch}%"`;
    }
    if (category) {
      filter += `&& category.id = "${category}"`;
    }

    if (selectedFilter === "not-picked-up") {
      filter += `&& pickup = ""`;
    } else if (selectedFilter === "picked-up") {
      filter += `&& pickup != ""`;
    }

    const result = await pb.collection("items").getFullList({
      expand: "category",
      filter: filter,
      sort: "-founddate",
    });
    setItems(result);
  };

  const [categories, setCategories] = useState<RecordModel[]>([]);
  const fetchCategories = async () => {
    const result = await pb.collection("categories").getFullList();
    setCategories(result);
  };

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchItems();
  };

  const handlePickup = async (itemId: string) => {
    let pickup = prompt("Abholer:in?");
    if (!pickup) return;
    try {
      await pb.collection("items").update(itemId, {
        pickup: pickup,
      });
      await fetchItems();
      toast.success("Fundsache abgeholt 🎉");
    } catch (e) {
      console.log(e);
      toast.error("Fehler beim Speichern");
    }
  };

  const logout = () => {
    pb.authStore.clear();
    navigate("/login");
  };

  return (
    <>
      <h5
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div style={{display: "flex", gap: 20}}>
          <Link to={`/admin/add`}>Fundsache hinzufügen</Link>
          <Link to={`/admin/stats`}>Statistik</Link>
        </div>
        <a href="#" onClick={logout}>
          Logout
        </a>
      </h5>

      <h4>Suche</h4>
      <form onSubmit={handleSubmit}>
        <label htmlFor="start">gefunden zwischen</label>
        <input
          className="auto-width mx-5"
          type="date"
          id="start"
          name="start"
          required
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <label htmlFor="end">und</label>
        <input
          className="auto-width mx-5"
          type="date"
          id="end"
          name="end"
          required
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <br />
        <label htmlFor="category">aus der Kategorie</label>
        <select
          className="auto-width mx-5"
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Alle Kategorien</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <br />

        <fieldset>
          <input
            type="radio"
            name="radioBtn"
            value="all"
            checked={selectedFilter === "all"}
            onChange={() => setSelectedFilter("all")}
          />
          <label>Abgeholte und nicht abgeholte Fundsachen</label>
          <input
            type="radio"
            name="radioBtn"
            value="not-picked-up"
            checked={selectedFilter === "not-picked-up"}
            onChange={() => setSelectedFilter("not-picked-up")}
          />
          <label>Nicht-abgeholte Fundsachen</label>
          <input
            type="radio"
            name="radioBtn"
            value="picked-up"
            checked={selectedFilter === "picked-up"}
            onChange={() => setSelectedFilter("picked-up")}
          />
          <label>Abgeholte Fundsachen</label>
        </fieldset>

        <label htmlFor="textSearch">Freie Suche</label>
        <input
          style={{ width: "auto" }}
          className="mx-5"
          type="text"
          id="textSearch"
          name="textSearch"
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
          autoFocus
        />
        <button
          style={{ paddingLeft: 40, paddingRight: 40 }}
          className="auto-width"
          type="submit"
        >
          Suchen
        </button>
      </form>

      <h4 style={{ marginTop: 10 }}>Ergebnisse</h4>
      <p>Es wurden {items.length} Objekte gefunden.</p>

      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          admin={true}
          handlePickup={handlePickup}
        />
      ))}
    </>
  );
}

export default Admin;
