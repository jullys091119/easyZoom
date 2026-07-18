import "./App.css";

function App() {
  const authEndpoint = "http://localhost:4000/signature";

  const meetingNumber = "86756125662";

  const getSignature = async () => {
    try {
      console.log("Llamando al servidor...");

      const response = await fetch(authEndpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          meetingNumber,

          role: 0,
        }),
      });

      console.log("Código respuesta:", response.status);

      const data = await response.json();

      console.log("Respuesta del servidor:");

      console.log(data);

      alert("Signature recibida: " + data.signature.substring(0, 30) + "...");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="App">
      <h1>Prueba Zoom Signature</h1>

      <button onClick={getSignature}>Pedir Signature</button>
    </div>
  );
}

export default App;
