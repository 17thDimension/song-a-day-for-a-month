
/**
 * Ryan Wieghard modifies the original source from Google firebase 
 * github examples here:
 *
 * 1) https://github.com/firebase/functions-samples/tree/master/delete-unused-accounts-cron
 * 2) https://github.com/firebase/functions-samples/blob/master/text-moderation/functions/index.js 
 * 
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
var _ = require('lodash');



exports.collaboration_migration = functions.https.onRequest((req, res) => {
  // Fetch all user details.
  getSongs().then(songs => {
    var db = admin.database();
    var ref = db.ref("/collaboration_songs");
    // Modified: changes filter to look for songs without essential attributes
    //const parentless_songs = songs.filter(
      //  song =>  typeof(song.collaboration_id) === "undefined");
    const parentless_songs = songs;
    var song_id;
    console.log('number of parentless songs is: ', parentless_songs.length);
    for (var i=0; i< parentless_songs.length; i++) {
        song_id = parentless_songs[i].key;
        var songRef = db.ref('/songs').child(song_id);
        var newCollab = ref.push();
        var newSongRef = newCollab.child('songs').push();
        newCollab.child('songs').child(newSongRef.key).set(song_id);
        newCollab.child('timestamp').set(parentless_songs[i].timestamp);
        songRef.child('collaboration_id').set(newCollab.key);
    }
    res.send('finished migration');
  });
});

exports.collaboration_clean_up = functions.https.onRequest((req, res) => {
  // Fetch all user details.
  getCollaborationSongs().then(songs => {
    // Modified: changes filter to look for songs without essential attributes
    const songless_songs = songs;
    var db = admin.database();

    var song_id;
    console.log('number of parentless songs is: ', songless_songs.length);
    for (var i=0; i< songless_songs.length; i++) {

         var collabRef = db.ref('/collaboration_songs').child(songless_songs[i].key);
         collabRef.remove();
    }
    res.send('finished migration');
  });
});

exports.collaboration_timestamp_migration = functions.https.onRequest((req, res) => {
  // Fetch all user details.
  getSongs().then(songs => {
    var db = admin.database();
    var ref = db.ref("/collaboration_songs");
    // Modified: changes filter to look for songs without essential attributes

    var collab_id;
    for (var i=0; i< songs.length; i++) {
        collab_id = songs[i].collaboration_id;
        var collabRef = db.ref('/collaboration_songs').child(collab_id);
        collabRef.child('timestamp').set(songs[i].timestamp);
        //collabRef.child('$priority').set(-1 * Date.parse(songs[i].timestamp));
    }
    res.send('finished migration');
  });
});


exports.songmigration = functions.https.onRequest((req, res) => {
  // Fetch all user details.
  getSongs().then(songs => {
    var db = admin.database();
  	var ref = db.ref("/songs");
    // Modified: changes filter to look for songs without essential attributes
    const incompleteSongs = songs.filter(
        song =>  typeof(song.artist_timestamp) === "undefined" || typeof(song.artist) === "undefined");

    var song_id;
    console.log('number of incomplete songs is: ', incompleteSongs.length);
    for (var i=0; i< incompleteSongs.length; i++) {
         song_id = incompleteSongs[i].key;
         if (incompleteSongs[i].key && incompleteSongs[i].artist && incompleteSongs[i].artist.key && incompleteSongs[i].timestamp){
         	    ref.child(song_id).child("artist_timestamp").set(incompleteSongs[i].artist.key + "_" + incompleteSongs[i].timestamp); 
         } else {
         	console.log(incompleteSongs[i]);
          let songToDelete = ref.child(song_id);
          songToDelete.remove().then(function(){
            console.log('successfully deleted song', song_id);
          });
         }
    }
    res.send('finished migration');
  });
});

/**
 * Returns the list of all songs
 */
function getSongs(songIds = []) {
	var db = admin.database();
	var ref = db.ref("/songs");
	return ref.once("value").then((snapshot) => {
	   var val = snapshot.val();
	   songIds = songIds.concat(Object.keys(val));
	   var i;
      var songs = [];
	  for (i=0; i < songIds.length; i++){
	  	songs.push(val[songIds[i]]);
	  	songs[i].key = songIds[i];
	  }
	  return songs;
	});
};

/**
 * Returns the list of all collab songs
 */
function getCollaborationSongs(songIds = []) {
  var db = admin.database();
  var ref = db.ref("/collaboration_songs");
  return ref.once("value").then((snapshot) => {
     var val = snapshot.val();
     songIds = songIds.concat(Object.keys(val));
     var i;
      var songs = [];
    for (i=0; i < songIds.length; i++){
      songs.push(val[songIds[i]]);
      songs[i].key = songIds[i];
    }
    return songs;
  });
};



exports.artistmigration = functions.https.onRequest((req, res) => {
  // Fetch all user details.
  getArtists().then(artists => {
    var db = admin.database();
    var ref = db.ref("/public_artists");
    // Modified: changes filter to look for songs without essential attributes
    const publicArtists = _.map(artists, (artist)=> {
      return artistToPublicArtist(artist); 
    });

    for (var i=0; i< artists.length; i++) {
         ref.child(artists[i].key).set(artists[i]);
    }
    res.send('finished migration');
  });
});

function artistToPublicArtist(artist){
   if (artist.songs){
        artist.songCount = Object.keys(artist.songs).length;
      } else {
        artist.songCount = 0;
      }      
      delete artist.songs;
      delete artist.last_transmission;
      return artist;
}

/**
 * Returns the list of all songs
 */
function getArtists(artistIds = []) {
  var db = admin.database();
  var ref = db.ref("/artists");
  return ref.once("value").then((snapshot) => {
     var val = snapshot.val();
     artistIds = artistIds.concat(Object.keys(val));
     var i;
    var artists = [];
    for (i=0; i < artistIds.length; i++){
      artists.push(val[artistIds[i]]);
      artists[i].key = artistIds[i];
    }
    return artists;
  });
};

exports.songduplicatecleanup = functions.https.onRequest((req, res) => {
  var list_of_duplicate_ids = ['-LCRdsOYuvbqsptO9oZe', '-LCRdP9sLbyo4zWizgTi', '-LCRd2amMlEQWE8y4a3E', '-LCRcG51OjWtRPuY7z5w', 
  '-LCQyH-mDK3S4knCvy21', '-LCQxzAvpqk8UFFsIAFp', '-LCQxh3wFjCZ4bWOUMD8', '-LCQwoQj-SNRgY_olg6G', '-LCQwF5PKF6qKlhL9nZY',
  '-LCQv67fyQnjFLs02GtG', '-LCQuPXbD7cCkMCyOzVo', '-LCQtrg_ytscmm9Xkm3V', '-LCQtEIe6DOkK21ut9zI', '-LCQs_BQtzi6U6LmeF2H',
  '-LCQrL2RhboWkhssh7FZ', '-LCQqVPfjBJfSHSqj8JQ'];
  console.log(list_of_duplicate_ids);
  var db = admin.database();
  var ref, collabRef;
  for (var i = 0; i < list_of_duplicate_ids.length; i++){
    ref = db.ref('/songs').child(list_of_duplicate_ids[i]);
    return ref.once("value").then((snapshot) => {
     var val = snapshot.val();
      collabRef = db.ref('/collaboration_songs').child(val.collaboration_id);
      ref.remove();
      collabRef.remove();
    });

  }
  res.send('good job'); 
});
