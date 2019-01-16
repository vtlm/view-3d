import {
    Stitch,
    AnonymousCredential,
    RemoteMongoClient
  } from "mongodb-stitch-browser-sdk";

  const client = Stitch.initializeDefaultAppClient("test1-jwipq");
  client.auth.loginWithCredential(new AnonymousCredential());
  // Get a MongoDB Service Client
  const mongodb = client.getServiceClient(
    RemoteMongoClient.factory,
    "mongodb-atlas"
  );
  // Get a reference to the blog database
  const db = mongodb.db("blog");
  
  // db.collection('comments').deleteMany({})
  
  function displayComments() {
    db.collection("comments")
      .find({}, { limit: 1000 })
      .asArray()
      .then(docs => console.log(docs));
    // db.collection("comments")
    //   .find({}, { limit: 1000 })
    //   .asArray()
    //   .then(docs => docs.map(doc => `<div>${doc.owner_id},${doc.comment}</div>`))
    //   .then(comments => document.getElementById("comments").innerHTML = comments)
  }
  
  function displayCommentsOnLoad() {
    client.auth
      .loginWithCredential(new stitch.AnonymousCredential())
      .then(displayComments)
      .catch(console.error);
  }
  
  function addComment() {
    const newComment = document.getElementById("new_comment");
    console.log("add comment", client.auth.user.id);
    db.collection("comments")
      .insertOne({ owner_id: client.auth.user.id, comment: newComment.value })
      .then(displayComments);
    newComment.value = "";
  }

  export default db
  export {client}