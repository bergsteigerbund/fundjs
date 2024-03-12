import { useNavigate } from "react-router-dom";
import { RecordModel } from "pocketbase";

import { baseUrl, formatDate } from "../util";

function Item({
  item,
  admin,
  handlePickup,
}: {
  item: RecordModel;
  admin?: boolean;
  handlePickup?: (id: string) => void;
}) {
  const navigate = useNavigate();

  const handleItemClick = () => {
    if (!admin) {
      return;
    }
    navigate(`/admin/edit/${item.id}`);
  };

  const handlePickupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handlePickup && handlePickup(item.id);
  };

  return (
    <div
      className="item-card"
      style={{
        display: "inline-block",
        marginRight: 20,
        marginBottom: 20,
        borderRadius: 20,
        cursor: admin ? "pointer" : "default",
      }}
      onClick={handleItemClick}
    >
      {item.image ? (
        <img
          style={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            width: 440,
          }}
          src={`${baseUrl}/api/files/items/${item.id}/${item.image}`}
        />
      ) : (
        "kein Bild"
      )}
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: "bold", marginBottom: 20 }}>
          {item.comment}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>{item.expand?.category.name || item.category}</div>
          {item.location && (
            <div style={{ fontWeight: "bold" }}>{item.location}</div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>{item.foundlocation}</div>
          <div>{formatDate(item.founddate)}</div>
        </div>

        {admin && (
          <div style={{ marginTop: 10 }}>
            {item.pickup ? (
              <span>Abgeholt von: {item.pickup}</span>
            ) : (
              <span>
                <a href="#" onClick={handlePickupClick}>
                  Abholen
                </a>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Item;
