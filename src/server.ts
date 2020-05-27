import express from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles, isValidUrl } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */
  app.get("/filteredimage", async (req, res) => {
    const { image_url } = req.query;

    if (!image_url) {
      return res.status(400).send("Image URL is required.");
    }

    if (!isValidUrl(image_url)) {
      return res.status(400).send("Image URL is not valid.");
    }

    let filteredImagePath: string;
    try {
      filteredImagePath = await filterImageFromURL(image_url);
    } catch (err) {
      console.error(
        "The following error encountered while filtering the image: ",
        err
      );
      return res.status(500).send({ message: "Error while filtering image" });
    }

    res
      .status(201)
      .sendFile(filteredImagePath, () => deleteLocalFiles([filteredImagePath]));
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
