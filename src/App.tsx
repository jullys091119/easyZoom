import "./App.css";

import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";

import { useZoomMeeting } from "./hooks/useZoomMeetings";

import ZoomControls from "./components/ZoomControls";

import { collection, getDocs } from "firebase/firestore";

import { db } from "./firebase";

function App() {
  const [meetings, setMeetings] = useState<any[]>([]);

  const [meeting, setMeeting] = useState<any>(null);

  const [started, setStarted] = useState(false);

  // Obtener todas las reuniones desde Firebase
  useEffect(() => {
    async function loadMeetings() {
      try {
        const snapshot = await getDocs(collection(db, "meetings"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,

          ...doc.data(),
        }));

        console.log("Reuniones:", data);

        setMeetings(data);
      } catch (error) {
        console.error("Error cargando reuniones:", error);
      }
    }

    loadMeetings();
  }, []);

  const zoom = useZoomMeeting({
    user: meeting?.user || "",

    number: meeting?.number || "",

    pass: meeting?.pass || "",
  });

  // Entrada automática después de seleccionar reunión
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
      {!meeting && !zoom.joined && (
        <>
          <h1>Selecciona una reunión</h1>

          {meetings.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setMeeting(item);

                setStarted(false);
              }}
            >
              {item.user}
            </button>
          ))}
        </>
      )}

      {meeting && !zoom.joined && <h1>Conectando a {meeting.user}...</h1>}

      {zoom.joined && <h1>Reunión conectada: {meeting.user}</h1>}
    </div>
  );
}

export default App;
