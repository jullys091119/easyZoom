import { useEffect, useState } from "react";

interface Props {
  onReady: () => void;
}

export default function MeetingWelcomeScreen({ onReady }: Props) {
  const [available, setAvailable] = useState(false);

  function checkSchedule() {
    const now = new Date();

    const day = now.getDay();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Jueves 18:00
    const thursday = day === 4 && (hour > 18 || (hour === 18 && minutes >= 0));

    // Sábado 17:00
    const saturday = day === 6 && (hour > 17 || (hour === 17 && minutes >= 0));

    if (thursday || saturday) {
      setAvailable(true);
    }
  }

  useEffect(() => {
    checkSchedule();

    const timer = setInterval(() => {
      checkSchedule();
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="welcome-screen">
      <h1>Reunión semanal</h1>

      {!available && (
        <>
          <h2>Aún no comienza la reunión</h2>

          <p>Nos vemos el jueves a las 6:00 PM o el sábado a las 5:00 PM</p>
        </>
      )}

      {available && (
        <>
          <h2>La reunión está disponible</h2>

          <button onClick={onReady}>Entrar</button>
        </>
      )}
    </div>
  );
}
