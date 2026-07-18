const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


app.post("/signature", (req, res) => {

  const {
    meetingNumber,
    role = 0
  } = req.body;


  if (!meetingNumber) {

    return res.status(400).json({
      error: "Falta meetingNumber"
    });

  }



  const iat = Math.floor(Date.now() / 1000) - 30;

  const exp = iat + (60 * 60 * 2);



  const payload = {

    appKey: process.env.ZOOM_SDK_KEY,

    sdkKey: process.env.ZOOM_SDK_KEY,

    mn: String(meetingNumber),

    role: Number(role),

    iat,

    exp

  };



  console.log("Generando firma para:");

  console.log(payload);



  try {


    const signature = jwt.sign(

      payload,

      process.env.ZOOM_SDK_SECRET,

      {
        algorithm: "HS256"
      }

    );



    res.json({

      signature

    });



  } catch(error) {


    console.error(
      "Error creando firma:",
      error
    );


    res.status(500).json({

      error: error.message

    });


  }


});





const PORT = process.env.PORT || 4000;



app.listen(PORT, () => {

  console.log(
    `Servidor Meeting SDK activo en puerto ${PORT}`
  );

});