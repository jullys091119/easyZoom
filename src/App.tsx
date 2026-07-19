import "./App.css";

import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";

import ZoomControls from "./components/ZoomControls";
import { useZoomMeeting } from "./hooks/useZoomMeetings";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "./firebase";


function App() {

  const [name, setName] = useState("");

  const [meeting, setMeeting] = useState<any>(null);

  const [started, setStarted] = useState(false);

  const [loading, setLoading] = useState(true);


  // Cargar nombre y reunión
  useEffect(() => {

    async function init() {

      try {

        const savedName = localStorage.getItem("username");


        const meetingRef = doc(
          db,
          "meetings",
          "current"
        );


        const meetingSnap = await getDoc(meetingRef);


        if (!meetingSnap.exists()) {

          console.error(
            "No existe meetings/current"
          );

          return;
        }


        const data = meetingSnap.data();


        setMeeting({

          number: data.number,

          pass: data.pass,

          user: savedName || ""

        });


        if (savedName) {

          setName(savedName);

        }


      } catch(error) {

        console.error(error);

      }
      finally {

        setLoading(false);

      }

    }


    init();


  }, []);



  // Guardar nombre
  function saveName() {


    if (!name.trim()) return;


    localStorage.setItem(
      "username",
      name
    );


    setMeeting((prev:any)=>({

      ...prev,

      user:name

    }));

  }



  const zoom = useZoomMeeting({

    user: meeting?.user || "",

    number: meeting?.number || "",

    pass: meeting?.pass || "",

  });



  // Entrar automáticamente
  useEffect(()=>{


    if(!meeting) return;


    if(!meeting.user) return;


    if(started) return;


    setStarted(true);


    zoom.startMeeting();


  },[
    meeting
  ]);





  // Crear controles
  useEffect(()=>{


    if(!zoom.joined) return;


    const container =
      document.createElement("div");


    container.id =
      "zoom-controls-container";


    document.body.appendChild(
      container
    );


    const root:Root =
      createRoot(container);



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



    return ()=>{

      root.unmount();

      container.remove();

    };


  },[
    zoom.joined,
    zoom.muted,
    zoom.camera,
    zoom.hand
  ]);




  if(loading){

    return (

      <div className="App">

        <h1>Cargando...</h1>

      </div>

    );

  }




  // Primera vez
  if(
    meeting &&
    !meeting.user
  ){

    return (

      <div className="App">

        <h1>
          Escribe tu nombre
        </h1>


        <input

          value={name}

          onChange={
            e=>setName(e.target.value)
          }

          onKeyDown={
            e=>{
              if(e.key==="Enter"){
                saveName();
              }
            }
          }

        />


        <button
          onClick={saveName}
        >

          Entrar

        </button>


      </div>

    );

  }




  if(!zoom.joined){

    return (

      <div className="App">

        <h1>
          Conectando a Zoom...
        </h1>

      </div>

    );

  }



  return (

    <div className="App">

      <h1>
        Bienvenido {name}
      </h1>


    </div>

  );


}


export default App;
