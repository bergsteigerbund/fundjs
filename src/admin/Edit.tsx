import { useState, useEffect } from "react";
import { RecordModel } from "pocketbase";
import { toast } from "react-toastify";
import { Link, useParams, useNavigate } from "react-router-dom";

import { pb, baseUrl } from "../util";

function Edit() {
  // check login
  const navigate = useNavigate();
  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate("/login");
    }
  }, []);

  // item id from url param
  let { itemId } = useParams<{ itemId: string }>();

  // form data
  const [founddate, setFounddate] = useState(new Date());
  const [foundlocation, setFoundlocation] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [comment, setComment] = useState("");
  const [pickup, setPickup] = useState("");

  const [categories, setCategories] = useState<RecordModel[]>([]);
  const fetchCategories = async () => {
    const result = await pb.collection("categories").getFullList();
    setCategories(result);
  };

  const fetchItem = async () => {
    if (!itemId) return;
    const result = await pb.collection("items").getOne(itemId, {
      expand: "category",
    });
    setFounddate(result.founddate);
    setFoundlocation(result.foundlocation);
    setImage(result.image);
    setCategory(result.expand?.category.id);
    setLocation(result.location);
    setComment(result.comment);
    setPickup(result.pickup);
  };

  useEffect(() => {
    fetchCategories();
    fetchItem();
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!itemId) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await pb.collection("items").update(itemId, {
        founddate: founddate,
        foundlocation: foundlocation,
        category: category,
        location: location,
        comment: comment,
        pickup: pickup,
      });
      toast.success("Gespeichert");
      navigate("/admin");
    } catch (error) {
      toast.error(error?.toString() || "Fehler");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Wirklich löschen?")) return;
    if (!itemId) return;
    if (submitting) return;
    try {
      await pb.collection("items").update(itemId, {
        deleted: new Date(),
      });
      toast.success("Gelöscht");
      navigate("/admin");
    } catch (error) {
      toast.error(error?.toString() || "Fehler");
    }
  };
  return (
    <>
      <h5 style={{ marginTop: 30 }}>
        <Link to={`/admin`}>Zurück</Link>
      </h5>
      <h1>Objekt bearbeiten</h1>
      <form onSubmit={handleSubmit}>
        <p>
          ID: <code>{itemId}</code>
        </p>
        {image && (
          <img
            src={`${baseUrl}/api/files/items/${itemId}/${image}`}
            width="500px"
            style={{ marginBottom: 30, display: "block" }}
          />
        )}
        <label className="label-150" htmlFor="founddate">
          Funddatum
        </label>
        <input
          className="auto-width"
          type="date"
          id="founddate"
          name="founddate"
          value={new Date(founddate).toISOString().split("T")[0]}
          onChange={(e) => setFounddate(new Date(e.target.value))}
        />
        <br />
        <label className="label-150" htmlFor="foundlocation">
          Fundort
        </label>
        <input
          className="auto-width"
          type="text"
          id="foundlocation"
          name="foundlocation"
          value={foundlocation}
          onChange={(e) => setFoundlocation(e.target.value)}
        />
        <br />
        <label className="label-150" htmlFor="category">
          Kategorie
        </label>
        <select
          className="auto-width"
          id="category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <br />
        <label className="label-150" htmlFor="location">
          Standort
        </label>
        <input
          className="auto-width"
          type="text"
          id="location"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <br />
        <label className="label-150" htmlFor="comment">
          Kommentar
        </label>
        <input
          className="auto-width"
          type="text"
          id="comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <br />
        <label className="label-150" htmlFor="pickup">
          Abholer
        </label>
        <input
          className="auto-width"
          type="text"
          id="pickup"
          name="pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
        <br />
        <button className="auto-width" type="submit">
          Speichern
        </button>
      </form>
      <button
        style={{ backgroundColor: "#9B2318" }}
        className="auto-width"
        onClick={handleDelete}
      >
        Löschen
      </button>
    </>
  );
}

export default Edit;
