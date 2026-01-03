import app from "./src/app.js";
import connectDB from "./src/config/connectDB.js";
import "./src/config/env.js";

const port = process.env.PORT || 3006;
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhsot:${port}`);
    });
  })
  .catch((error) => {
    console.log(`MongoDB ERROR`, error);
  });
