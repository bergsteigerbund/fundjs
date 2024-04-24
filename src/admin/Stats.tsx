import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RecordModel } from "pocketbase";

import { pb, formatDate, formatDatePlusSixMonths } from "../util";

function Stats() {
  // check login
  const navigate = useNavigate();
  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate("/login");
    }
  }, []);

  const [count, setCount] = useState(0);
  const [pickedUp, setPickedUp] = useState(0);
  const [notPickedUp, setNotPickedUp] = useState(0);

  const [boxes, setBoxes] = useState<RecordModel[]>([]);

  const fetchStats = async () => {
    const resultCountAll = await pb.collection("countAll").getList();
    setCount(resultCountAll.items[0].count);

    const resultCountPickedUp = await pb.collection("countPickedUp").getList();
    setPickedUp(resultCountPickedUp.items[0].count);

    const resultNotPickedUp = await pb.collection("countNotPickedUp").getList();
    setNotPickedUp(resultNotPickedUp.items[0].count);
  };

  const fetchBoxes = async () => {
    const result = await pb.collection("boxes").getFullList();
    setBoxes(result);
  };

  useEffect(() => {
    fetchStats();
    fetchBoxes();
  }, []);

  const isAfterSixMonths = (date: string) => {
    const dateObj = new Date(date);
    dateObj.setMonth(dateObj.getMonth() + 6);
    const now = new Date();
    return dateObj < now;
  };
  return (
    <>
      <h5 style={{ marginTop: 20 }}>
        <Link to="/admin">Zurück</Link>
      </h5>

      <h6>Kisten</h6>
      <table>
        <thead>
          <tr>
            <th>Kiste</th>
            <th>Beginn</th>
            <th>Ende</th>
            <th>Anzahl</th>
            <th>Ablauf</th>
          </tr>
        </thead>
        <tbody>
          {boxes.map((box) => {
            return (
              <tr key={box.id}>
                <td><Link to={`/admin/box/${box.location}`}>{box.location}</Link></td>
                <td>{formatDate(box.oldest)}</td>
                <td>{formatDate(box.youngest)}</td>
                <td>{box.count}</td>
                {isAfterSixMonths(box.youngest) ? (
                  <td
                    style={{ backgroundColor: "#F17961", fontWeight: "bold" }}
                  >
                    {formatDatePlusSixMonths(box.youngest)}
                  </td>
                ) : (
                  <td>{formatDatePlusSixMonths(box.youngest)}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      <h6>Überblick</h6>
      <table>
        <tbody>
          <tr>
            <td>Nicht abgeholt</td>
            <td>{notPickedUp}</td>
          </tr>
          <tr>
            <td>Abgeholt</td>
            <td>{pickedUp}</td>
          </tr>
          <tr>
            <td>Gesamt</td>
            <td>{count}</td>
          </tr>
        </tbody>
      </table>

      <p>
        Abholquote: {count !== 0 ? ((pickedUp / count) * 100).toFixed(1) : 0} %
      </p>
      <progress
        value={count !== 0 ? ((pickedUp / count) * 100).toFixed(0) : 0}
        max="100"
      />
    </>
  );
}

export default Stats;
