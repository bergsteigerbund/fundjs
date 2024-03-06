import { useState, useEffect } from "react";
import { RecordModel } from "pocketbase";

import { pb } from "./util";
import Item from "./components/Item";

function App() {
  const [items, setItems] = useState<RecordModel[]>([]);
  const [categories, setCategories] = useState<RecordModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // form data
  const [start, setStart] = useState(
    new Date(new Date().getTime() - 3 * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  ); // default start date is 3 weeks ago
  const [end, setEnd] = useState(
    new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  ); // default end date is tomorrow
  const [category, setCategory] = useState("");
  const [novz, setNovz] = useState(false);

  const fetchItems = async () => {
    let filter = `founddate >= "${start}" && founddate <= "${end}"`;
    if (category) {
      filter += `&& category = "${category}"`;
    }
    if (novz) {
      filter += `&& foundlocation !~ '%Kletterhalle%' && foundlocation !~ '%Halle%'`;
    }
    const result = await pb.collection("publicItems").getFullList({
      filter: filter,
    });
    setItems(result);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [start, end, category, novz]);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await pb.collection("categories").getFullList();
      setCategories(result);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await fetchItems();
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="start">Ich suche Fundsachen, gefunden zwischen</label>
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
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <br />
        <label htmlFor="novz" style={{ paddingRight: "10px" }}>
          die NICHT im Vereinszentrum gefunden wurden
        </label>
        <input
          type="checkbox"
          id="novz"
          name="novz"
          checked={novz}
          onChange={(e) => setNovz(e.target.checked)}
        />
      </form>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <br />
          <p>Es wurden {items.length} Fundsachen gefunden.</p>
          {items.map((item) => (
            <Item key={item.id} item={item} />
          ))}
        </>
      )}
    </>
  );
}

export default App;
