
/**
 * Ryan Wieghard modifies the original source from Google
 * with modifications to the original source demonstrated in comments
 *
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for t`he specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
const rp = require('request-promise');
const promisePool = require('es6-promise-pool');
const PromisePool = promisePool.PromisePool;
const secureCompare = require('secure-compare');
// Maximum concurrent account deletions.
const MAX_CONCURRENT = 3;

/**
 * When requested this Function will delete every user accounts that has been inactive for 30 days.
 * The request needs to be authorized by passing a 'key' query parameter in the URL. This key must
 * match a key set as an environment variable using `firebase functions:config:set cron.key="YOUR_KEY"`.
 */
exports.songmigration = functions.https.onRequest((req, res) => {

  // Fetch all user details.
  getSongs().then(songs => {
    var db = admin.database();
  	var ref = db.ref("/songs");
    // Modified: changes filter to look for users without an attribute
    const incompleteSongs = songs.filter(
        song =>  typeof(song.artist_timestamp) === "undefined") || typeof(song.artist) === "undefined";
    var song_id;
    console.log(incompleteSongs.length);
    for (var i=0; i< incompleteSongs.length; i++) {
         song_id = incompleteSongs[i].key;
         if (incompleteSongs[i].key && incompleteSongs[i].artist && incompleteSongs[i].artist.key && incompleteSongs[i].timestamp){
         	    ref.child(song_id).child("artist_timestamp").set(incompleteSongs[i].artist.key + "_" + incompleteSongs[i].timestamp); 
         } else {
         	console.log(incompleteSongs[i]);
         	console.log('weird input');
         }
    }
    res();
  });
});

/**
 * Returns the list of all songs
 */
function getSongs(songIds = []) {
	var db = admin.database();
	var ref = db.ref("/songs");
	console.log('get songs');
	return ref.once("value").then((snapshot) => {
	   var val = snapshot.val();
	   songIds = songIds.concat(Object.keys(val));
	   var i;
      var songs = [];
	  for (i=0; i < songIds.length; i++){
	  	//console.log(val[songIds[i]]);
	  	songs.push(val[songIds[i]]);
	  	songs[i].key = songIds[i];
	  }
	  return songs;
	
	});
};
