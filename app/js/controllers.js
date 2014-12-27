'use strict';

/* Controllers */

angular.module('myApp.controllers', ['firebase.utils', 'simpleLogin'])
  .controller('HomeCtrl', ['$scope', 'fbutil', 'user', 'FBURL', function($scope, fbutil, user, FBURL) {
    $scope.user = user;
    $scope.FBURL = FBURL;
  }])


  .controller('MissionCtrl', ['$scope', 'fbutil', function($scope, fbutil) {
  }])

  .controller('ArtistCtrl', ['$scope', 'artistPage','$routeParams', function($scope, artistPage, $routeParams) {
    artistPage.fetch($routeParams.artist)
    $scope.artist=artistPage.artist;
    $scope.predicate='-key';


  }])

  .controller('ArchiveCtrl', ['$scope','songList', function($scope,songList) {
    $scope.songs=songList;
    $scope.predicate='-songs | length'
  }])


  .controller('ArtistsCtrl', ['$scope','artistList', function($scope,artistList) {
    var arts=artistList;
    $scope.artists=arts;
    $scope.moreArtists=function(){
      console.log($scope.moreArtists);
    }
  }])

.controller('SongCtrl', ['$scope','$routeParams','fbutil', function($scope, $routeParams, fbutil) {
  $scope.song=fbutil.syncObject('songs/'+$routeParams.song);
}])
.controller('MediaCtrl', ['$scope','$rootScope','$routeParams','fbutil', function($scope,$rootScope, $routeParams, fbutil) {


}])

.controller('SongsCtrl', ['$scope','songs','$window', function($scope,songs,$window) {
  $scope.songs=songs.list;
  songs.fetch(function(){
    console.log('fetched');
  });
  $scope.predicate='-timestamp'
  $scope.moreSongs=function(){
    songs.fetch(function(){
      $scope.loading = false;
    });
  }


}])


  .controller('ChatCtrl', ['$scope', 'messageList', function($scope, messageList) {
    $scope.messages = messageList;
    $scope.addMessage = function(newMessage) {
      if( newMessage ) {
        $scope.messages.$add({text: newMessage});
      }
    };
  }])

  .controller('LoginCtrl', ['$scope', 'simpleLogin', '$location', function($scope, simpleLogin, $location) {
    $scope.email = null;
    $scope.pass = null;
    $scope.confirm = null;
    $scope.createMode = false;

    $scope.login = function() {
      simpleLogin.login();
    };

    function assertValidAccountProps() {
      if( !$scope.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.pass || !$scope.confirm ) {
        $scope.err = 'Please enter a password';
      }
      else if( $scope.createMode && $scope.pass !== $scope.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code? err.code : err + '';
    }
  }])

  .controller('AccountCtrl', ['$scope', 'simpleLogin', 'fbutil', 'user', '$location','$rootScope',
    function($scope, simpleLogin, fbutil, user, $location,$rootScope) {
      if ('me' in $scope){
        $scope.me.$bindTo($scope,'me');
        $scope.artist=$scope.me;
      }

      $scope.changePassword = function(pass, confirm, newPass) {
        resetMessages();
        if( !pass || !confirm || !newPass ) {
          $scope.err = 'Please fill in all password fields';
        }
        else if( newPass !== confirm ) {
          $scope.err = 'New pass and confirm do not match';
        }
        else {
          simpleLogin.changePassword(user.email, pass, newPass)
            .then(function() {
              $scope.msg = 'Password changed';

            }, function(err) {
              $scope.err = err;
            })
        }
      };

      $scope.clear = resetMessages;

      $scope.changeStatement = function(newStatement) {
        resetMessages();

      };
      $scope.chooseArt = function(avatar,wallart){
        resetMessages();
        console.log($scope);
        $scope.wallerr=avatar;
        $scope.avatarerr=wallart;
      };

      function resetMessages() {
        $scope.err = null;
        $scope.msg = null;
        $scope.emailerr = null;
        $scope.emailmsg = null;
        $scope.avatarmsg = null;
        $scope.avatarerr = null;
        $scope.wallmsg = null;
        $scope.wallerr = null;
      }
    }
  ])
  .controller('TransmitCtrl', ['$route','$timeout','$rootScope','$scope', 'simpleLogin','$firebase', 'fbutil',
  function($route,$timeout,$rootScope,$scope, simpleLogin,$firebase, fbutil) {
    $scope.refreshYourself(function(self){

      $scope.s3OptionsUri='/config/aws.json';
      self.$loaded(function(){
        $scope.destfolder='/media/'+self.alias;
      });
    });

    $scope.$on('s3upload:success',function(e) {
      $timeout(function() {
        console.log(e);
        $scope.media=e.targetScope['filename'];
        $scope.mediaType=e.targetScope['filetype'];
      });
    });

      $scope.calculateKey = function() {
        var today=new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
          dd='0'+dd
        }

        if(mm<10) {
          mm='0'+mm
        }
        today = mm+'/'+dd+'/'+yyyy;
        return CryptoJS.SHA1(today+$scope.me.$id).toString().substring(0,11)
      }


      $scope.fetchTodaysTranmission = function() {
        //check to see if we've transmitted a track
        $rootScope.refreshYourself(function(self){
          self.$loaded(function(){
            var sng=fbutil.syncObject('songs/'+$scope.calculateKey())
            sng.$loaded(function(){
              if (sng.media){
                $scope.song=sng;
              }
            });
          });
        });
      };

      $scope.fetchTodaysTranmission();
      $scope.delete=function(song){
        $scope.refreshYourself(function(self){
          console.log($scope.song);
          if (self.key==song.artist.key){
            $firebase(fbutil.ref('songs/'+song.key)).$set(null);
            $route.reload();
          }else{
            console.log('plx no hax kthnx');
          }
        });
      }
      $scope.sendTransmission = function() {
        if (!$scope.title){
          $scope.mediaErr=" title";
        }
        $scope.refreshYourself(function(self){
          var fresh_key=$scope.calculateKey($scope.transmission)
          var song={};
          song['info']=$scope.info||"whatever";
          song['title']=$scope.title||"untitled";
          song['timestamp']= (new Date()).toISOString();
          song['media']={}
          song['key']=fresh_key;
          song['media']['src']= $scope.media;
          song['media']['type']= $scope.mediaType;
          self.$loaded(function(){
            song['artist']={'alias':self.alias||"",'key':self.$id,'avatar':self.avatar||""};
            var rf=fbutil.ref('songs/'+song.key)
            $firebase(rf).$set(song).then(function(){
              var mysongs = fbutil.syncObject(['artists', self.$id,'songs']);
                mysongs.$loaded(function(){
                  mysongs[song.key]=true;
                  mysongs.$save();
                })
              $scope.song=fbutil.syncObject('songs/'+$scope.calculateKey());
            });
          });



        });
      };

    function checkMedia() {
      $scope.err = null;
      $scope.msg = null;
      $scope.emailerr = null;
      $scope.emailmsg = null;
    }
  }
  ])
  .controller('SketchCtrl', ['$scope', 'simpleLogin', 'fbutil',
  function($scope, simpleLogin, fbutil) {
    console.log('sketch it up!');
  }
  ])
  .controller('NavCtrl', ['$scope',
  function($scope) {
    $scope.hideNav=true;
    $scope.toggleNav=function(){
      $scope.hideNav=!$scope.hideNav;
    }

  }
  ])
