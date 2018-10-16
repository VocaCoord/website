const express = require("express");
const path = require("path");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const mongodb = require("mongodb");

const PORT = process.env.PORT || 5000;

const classroomsCollection = "classrooms";
var db;

// Multi-process to utilize all CPU cores.
if (cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
  const app = express();

  mongodb.MongoClient.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/VocaCoord",
    { useNewUrlParser: true },
    (err, client) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      db = client.db();
    }
  );

  // Priority serve any static files.
  app.use(express.static(path.resolve(__dirname, "../react-ui/build")));

  // Answer API requests.
  app.get("/api", (req, res) => {
    res.set("Content-Type", "application/json");
    res.send('{"message":"Hello from the custom server!"}');
  });

  app.get("/api/classrooms", (req, res) => {
    db.collection(classroomsCollection)
      .find({})
      .toArray((err, docs) => {
        res.status(200).json(docs);
      });
  });

  app.get("/api/create", (req, res) => {
    db.collection(classroomsCollection)
      .find({}, { projection: { _id: 0 } })
      .toArray((err, classrooms) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }

        let classCodes = classrooms.map(classroom => classroom.classCode);

        do {
          classCode = Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();
        } while (classCodes.includes(classCode));

        db.collection(classroomsCollection).insertOne(
          { classCode },
          (err, doc) => {
            res.status(201).json(doc.ops[0]);
          }
        );
      });
  });

  app.get("/api/join/:classCode", (req, res) => {
    let { classCode } = req.params;

    db.collection(classroomsCollection)
      .find({}, { projection: { _id: 0 } })
      .toArray((err, classrooms) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }

        let classCodes = classrooms.map(classroom => classroom.classCode);

        if (classCodes.includes(classCode)) {
          console.log("Joined an existing class");
        } else {
          console.log("Class doesn't exist");
        }

        res.sendStatus(200);
      });
  });

  app.get("/api/remove/:classCode", (req, res) => {
    let { classCode } = req.params;

    if (classCode === 'all') db.collection(classroomsCollection).deleteMany({});

    db.collection(classroomsCollection).deleteOne({ classCode });

    db.collection(classroomsCollection).find({}).toArray((err, docs) => {
      res.status(200).json(docs);
    });
  });

  // All remaining requests return the React app, so it can handle routing.
  app.get("*", (request, response) => {
    response.sendFile(
      path.resolve(__dirname, "../react-ui/build", "index.html")
    );
  });

  app.listen(PORT, () => {
    console.error(
      `Node cluster worker ${process.pid}: listening on port ${PORT}`
    );
  });
}