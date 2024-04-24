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

  const fetchItems = async () => {
    console.log(boxName);

    const result = await pb.collection("items").getFullList({
      filter: `location = "${boxName}"`,
      expand: "category",
    });
    setItems(result);
  };

  useEffect(() => {
    fetchItems();
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

  return (
    <>
      <h4 style={{ marginTop: 20 }}>
        <Link to={`/admin/stats`}>Zurück</Link>
      </h4>

      <h1>{boxName}</h1>

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
