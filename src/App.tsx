import "./App.css";

import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";

import { useZoomMeeting } from "./hooks/useZoomMeetings";

import ZoomControls from "./components/ZoomControls";

import { collection, getDocs } from "firebase/firestore";

import { db } from "./firebase";

function App() {
  const [meeting, setMeeting] = useState<any>(null);

  const [started, setStarted] = useState(false);

  // Obtener reunión desde Firebase
  useEffect(() => {
    async function loadMeeting() {
      try {
        const snapshot = await getDocs(collection(db, "meetings"));

        snapshot.forEach((doc) => {
          console.log("Documento:", doc.id);

          console.log("Datos:", doc.data());

          setMeeting(doc.data());
        });
      } catch (error) {
        console.error("Error cargando reunión:", error);
      }
    }

    loadMeeting();
  }, []);

  const zoom = useZoomMeeting({
    user: meeting?.user || "",

    number: meeting?.number || "",

    pass: meeting?.pass || "",
  });

  // Entrada automática a la reunión
  useEffect(() => {
    if (!started && meeting) {
      setStarted(true);

      zoom.startMeeting();
    }
  }, [started, meeting, zoom]);

  // Crear controles cuando entra al Zoom
  useEffect(() => {
    if (!zoom.joined) return;

    const container = document.createElement("div");

    container.id = "zoom-controls-container";

    document.body.appendChild(container);

    const root: Root = createRoot(container);

    root.render(
      <ZoomControls
        muted={zoom.muted}
        camera={zoom.camera}
        hand={zoom.hand}
        onMute={zoom.toggleMute}
        onCamera={zoom.toggleCamera}
        onHand={zoom.toggleHand}
        onLeave={zoom.leave}
      />,
    );

    return () => {
      root.unmount();

      container.remove();
    };
  }, [zoom.joined, zoom.muted, zoom.camera, zoom.hand]);

  return (
    <div className="App">
      {!meeting && <h1>Cargando reunión...</h1>}

      {meeting && !zoom.joined && <h1>Conectando a la reunión...</h1>}

      {zoom.joined && <h1>Reunión conectada</h1>}
    </div>
  );
}

export default App;
