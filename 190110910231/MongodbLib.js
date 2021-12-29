exports.myInsert = (insertDBName, insertCollectName, insertData) => {
    const MongoClient = require('mongodb').MongoClient;
    const assert = require('assert');
    // Connection URL
    const url = 'mongodb://localhost:27017';
    //  const url = 'mongodb://172.21.2.236:27017';
    // Database Name
    const dbName = insertDBName;
    const client = new MongoClient(url);
    // Use connect method to connect to the server
    client.connect(function (err) {
        //   assert.equal(null, err);
        if (err) { console.log("link fail") }
        console.log('Connected successfully to server');

        const db = client.db(dbName);
        // Get the documents collection
        const collection = db.collection(insertCollectName);
        // Insert some documents
        collection.insertMany(insertData, function (err, result) {
            if (err) { "insert fail" }
            else { console.log('Inserted 3 documents into the collection') };
            console.log(result);
        });
        //client.close();
    });
}

exports.myfind = (insertDBName, insertCollectName, findData, callback) => {
    const MongoClient = require('mongodb').MongoClient;
    const assert = require('assert');
    // // Connection URL
    const url = 'mongodb://localhost:27017';
    // const url = 'mongodb://172.21.2.236:27017';
    // Database Name
    const dbName = insertDBName;
    const client = new MongoClient(url);
    // Use connect method to connect to the server
    client.connect(function (err) {
        if (err) { console.log("link fail") }
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        // Get the documents collection
        const collection = db.collection(insertCollectName);
        // Insert some documents
        collection.find(findData).toArray(function (err, docs) {
            console.log("Found the following records");
            console.log(docs);
            callback(docs);
        });
    });
}