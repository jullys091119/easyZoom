import "./App.css";

import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";

import { useZoomMeeting } from "./hooks/useZoomMeetings";

import ZoomControls from "./components/ZoomControls";

function App() {
  
  const zoom = useZoomMeeting({
  userName: "Carlos",
  userEmail: "",
  meetingNumber: "82293951462",
  passWord: "cn1auQ"
});

  const [started, setStarted] = useState(false);

  // Entrada automática a la reunión
  useEffect(() => {
    if (!started) {
      setStarted(true);
      zoom.startMeeting();
    }
  }, [started, zoom]);

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
      />
    );

    return () => {
      root.unmount();
      container.remove();
    };
  }, [
    zoom.joined,
    zoom.muted,
    zoom.camera,
    zoom.hand,
  ]);

  return (
    <div className="App">
      {!zoom.joined && (
        <h1>Conectando a la reunión...</h1>
      )}

      {zoom.joined && (
        <h1>Reunión conectada</h1>
      )}
    </div>
  );
}

export default App;