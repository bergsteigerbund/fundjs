import { useState, useEffect, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { RecordModel } from "pocketbase";

import { pb } from "../util";

function Add() {
  // check login
  const navigate = useNavigate();
  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate("/login");
    }
  }, []);

  // form data
  const [funddatum, setFunddatum] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [fundort, setFundort] = useState("SBB Kletterhalle");
  const [kategorie, setKategorie] = useState("");
  const [standort, setStandort] = useState("Theke; Kiste ");
  const [kommentar, setKommentar] = useState("");

  // Categories
  const [categories, setCategories] = useState<RecordModel[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await pb.collection("categories").getFullList();
      setCategories(result);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await pb.collection("items").create({
        founddate: funddatum,
        foundlocation: fundort,
        image: imgFile,
        category: kategorie,
        location: standort,
        comment: kommentar,
      });
      toast.success("Fundsache hinzugefügt");
      setKommentar("");
      setKategorie("");
      setImgSrc("");
      setImgFile(undefined);
    } catch (e) {
      toast.error("Fehler beim Hinzufügen");
      console.log(e);
    }
  };

  // Webcam capture
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState("");
  const [imgFile, setImgFile] = useState<File>();
  const capture = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        setImgSrc(imageSrc);
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const imageFile = new File([blob], "image.jpg", {
              type: "image/jpeg",
            });
            setImgFile(imageFile);
          });
      }
    },
    [webcamRef, setImgSrc, setImgFile]
  );

  const handleSelectFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImgSrc(e.target?.result as string);
          setImgFile(file);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <>
      <h5 style={{ marginTop: 20 }}>
        <Link to={`/admin`}>Zurück</Link>
      </h5>
      <h1>Fundsachen hinzufügen</h1>
      <form onSubmit={handleSubmit}>
        <label className="label-150">Funddatum</label>
        <input
          className="auto-width mx-5"
          type="date"
          value={funddatum}
          onChange={(e) => setFunddatum(e.target.value)}
        />

        <br />
        <label className="label-150">Fundort</label>
        <input
          className="auto-width mx-5"
          type="text"
          value={fundort}
          onChange={(e) => setFundort(e.target.value)}
          required
        />

        <br />
        {imgSrc === "" ? (
          <>
            <Webcam
              style={{ display: "block", marginBottom: 10, maxWidth: "100%" }}
              audio={false}
              screenshotFormat="image/jpeg"
              ref={webcamRef}
              videoConstraints={{
                facingMode: "environment"
              }}
            ></Webcam>
            <button onClick={capture} autoFocus>
              Foto aufnehmen
            </button>
          </>
        ) : (
          <>
            <img
              style={{ display: "block", marginBottom: 10 }}
              height={500}
              width={700}
              src={imgSrc}
              alt="Captured Image"
            />
            <button
              className="secondary"
              onClick={(e) => {
                e.preventDefault();
                setImgSrc("");
              }}
            >
              Foto löschen
            </button>
          </>
        )}
        <button onClick={handleSelectFile} style={{marginLeft: 20}}>Datei wählen</button>
        <br />
        <br />
        <label className="label-150">Kategorie</label>
        <select
          className="auto-width mx-5"
          value={kategorie}
          onChange={(e) => setKategorie(e.target.value)}
          required
        >
          <option value="">Bitte auswählen</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <br />
        <label className="label-150">Standort</label>
        <input
          className="auto-width mx-5"
          type="text"
          value={standort}
          onChange={(e) => setStandort(e.target.value)}
          required
        />

        <br />
        <label className="label-150">Kommentar</label>
        <input
          className="auto-width mx-5"
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
          required
        />
        <br />
        <button className="auto-width" type="submit">
          Hinzufügen
        </button>
      </form>
    </>
  );
}

export default Add;
