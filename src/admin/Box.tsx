import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RecordModel } from "pocketbase";
import { toast } from "react-toastify";

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

  // box name from url param
  let { boxName } = useParams<{ boxName: string }>();

  const [items, setItems] = useState<RecordModel[]>([]);
  const [boxes, setBoxes] = useState<RecordModel[]>([]);
  const [destinationBox, setDestinationBox] = useState<string>("");

  const fetchItems = async () => {
    const result = await pb.collection("items").getFullList({
      filter: `location = "${boxName}"`,
      expand: "category",
    });
    setItems(result);
  };

  const fetchBoxes = async () => {
    const result = await pb.collection("boxes").getFullList();
    setBoxes(result);
  };

  useEffect(() => {
    fetchItems();
    fetchBoxes();
  }, []);

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

  const handleMoveAll = async () => {
    if (!destinationBox) {
      alert("Bitte Zielbox auswählen");
      return;
    }

    try {
      // move one by one
      for (let item of items) {
        await pb.collection("items").update(item.id, {
          location: destinationBox,
        });
        // remove from current list
        setItems((prevItems) =>
          prevItems.filter((prevItem) => prevItem.id !== item.id)
        );
      }
      toast.success("Fundsachen verschoben 🎉");
      navigate(`/admin/box/${destinationBox}`);
      boxName = destinationBox;
      fetchItems();
      fetchBoxes();

    } catch (e) {
      console.log(e);
      toast.error("Fehler beim Verschieben");
    }
  }

  return (
    <>
      <h4 style={{ marginTop: 20 }}>
        <Link to={`/admin/stats`}>Zurück</Link>
      </h4>

      <h1>{boxName}</h1>

      <div style={{ display: "flex", marginBottom: 20 }}>
        <span>Alles in <select
          className="auto-width mx-5"
          id="category"
          name="category"
          value={destinationBox}
          onChange={(e) => setDestinationBox(e.target.value)}
          style={{marginBottom: 0}}
        >
          <option value="">Zielbox auswählen</option>
          {boxes.map((box) => (
            <option key={box.id} value={box.location}>
              {box.location}
            </option>
          ))}
        </select></span>
        <button onClick={handleMoveAll} style={{marginLeft: 30}}>verschieben</button>
      </div>

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
