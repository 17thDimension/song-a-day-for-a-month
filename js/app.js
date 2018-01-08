(function() {
  window.addElement = function(container, tagName, attrs) {
    var fjs, k, tag, v;
    if (attrs == null) {
      attrs = {};
    }
    if (attrs.id && container.getElementById(attrs.id)) {
      return container.getElementById(attrs.id);
    }
    fjs = container.getElementsByTagName(tagName)[0];
    tag = container.createElement(tagName);
    for (k in attrs) {
      v = attrs[k];
      tag[k] = v;
    }
    fjs.parentNode.insertBefore(tag, fjs);
    return tag;
  };

  window.log = function() {
    return console.log(arguments);
  };

  Storage.prototype.setObject = function(key, value) {
    return this.setItem(key, JSON.stringify(value));
  };

  Storage.prototype.getObject = function(key) {
    var value;
    if (!(value = this.getItem(key))) {
      return;
    }
    return JSON.parse(value);
  };

}).call(this);

(function() {


}).call(this);

(function() {
  var app;

  app = angular.module(GLOBALS.ANGULAR_APP_NAME, [GLOBALS.ANGULAR_APP_NAME + ".templates", "ionic", "angulartics.google.analytics", "firebase", "angularMoment", "ngS3upload", "com.2fdevs.videogular", "com.2fdevs.videogular.plugins.buffering", "angular-scroll-complete"]).constant('FBURL', 'https://song-a-day.firebaseio.com/');

}).call(this);

(function() {
  var app, k, v;

  app = angular.module(GLOBALS.ANGULAR_APP_NAME);

  GLOBALS.APP_ROOT = location.href.replace(location.hash, "").replace("index.html", "");

  for (k in GLOBALS) {
    v = GLOBALS[k];
    app.constant(k, v);
  }

  app.run(function($rootScope) {
    return $rootScope.GLOBALS = GLOBALS;
  });

}).call(this);

(function() {
  var app;

  app = angular.module(GLOBALS.ANGULAR_APP_NAME);

  ionic.Platform.ready(function() {
    if (GLOBALS.ENV !== "test") {
      console.log('ionic.Platform is ready! Running `angular.bootstrap()`...');
    }
    return angular.bootstrap(document, [GLOBALS.ANGULAR_APP_NAME]);
  });

  app.run(function($log, $timeout, $rootScope, Auth, AccountService) {
    if (GLOBALS.ENV !== "test") {
      $log.debug("Ionic app \"" + GLOBALS.ANGULAR_APP_NAME + "\" has just started (app.run)!");
    }
    $timeout(function() {
      var ref;
      return (ref = navigator.splashscreen) != null ? ref.hide() : void 0;
    });
    Auth.$onAuth(function(user) {
      return $rootScope.loggedIn = !!user;
    });
    return AccountService.refresh(function(myself) {
      return $rootScope.myself = myself;
    });
  });

}).call(this);

(function() {
  var app;

  if (!GLOBALS.GOOGLE_ANALYTICS_ID) {
    return;
  }

  app = angular.module(GLOBALS.ANGULAR_APP_NAME);

  ionic.Platform.ready(function() {
    return app.config(function(googleAnalyticsCordovaProvider) {
      googleAnalyticsCordovaProvider.debug = GLOBALS.ENV !== 'production';
      return googleAnalyticsCordovaProvider.trackingId = GLOBALS.CORDOVA_GOOGLE_ANALYTICS_ID;
    });
  });

}).call(this);

(function() {
  var app;

  app = angular.module(GLOBALS.ANGULAR_APP_NAME);

  app.config(function($httpProvider) {
    var base;
    $httpProvider.useApplyAsync(true);
    (base = $httpProvider.defaults.headers).patch || (base.patch = {});
    $httpProvider.defaults.headers.patch['Content-Type'] = 'application/json';
    $httpProvider.defaults.headers.common["X-Api-Version"] = "1.0";
    return $httpProvider.interceptors.push(function($injector, $q, $log, $location) {
      return {
        responseError: function(response) {
          if (GLOBALS.ENV !== "test") {
            $log.debug("httperror: ", response.status);
          }
          if (response.status === 401) {
            $injector.invoke(function(Auth) {
              Auth.setAuthToken(null, null);
              return $location.path("/");
            });
          }
          return $q.reject(response);
        }
      };
    });
  });

}).call(this);

(function() {
  var app;

  app = angular.module(GLOBALS.ANGULAR_APP_NAME);

  app.config(function($ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(4);
    $ionicConfigProvider.templates.maxPrefetch(false);
    if (ionic.Platform.grade !== "a") {
      $ionicConfigProvider.views.transition("none");
      return $ionicConfigProvider.views.maxCache(2);
    }
  });

}).call(this);

(function() {
  var app;

  app = angular.module(GLOBALS.ANGULAR_APP_NAME);

  app.config(function($logProvider, $compileProvider) {
    if (GLOBALS.ENV === "production") {
      $logProvider.debugEnabled(false);
      return $compileProvider.debugInfoEnabled(false);
    }
  });

}).call(this);

(function() {
  var app;

  if (window.Rollbar == null) {
    return;
  }

  app = angular.module(GLOBALS.ANGULAR_APP_NAME);

  app.factory('$exceptionHandler', function($log) {
    return function(e, cause) {
      $log.error(e.message);
      return Rollbar.error(e);
    };
  });

  Rollbar.configure({
    payload: {
      deploy_time: GLOBALS.DEPLOY_TIME,
      deploy_date: moment(GLOBALS.DEPLOY_TIME).format(),
      bundle_name: GLOBALS.BUNDLE_NAME,
      bundle_version: GLOBALS.BUNDLE_VERSION
    },
    transform: function(payload) {
      var frame, frames, i, len, ref, ref1, ref2, results;
      if (frames = (ref = payload.data) != null ? (ref1 = ref.body) != null ? (ref2 = ref1.trace) != null ? ref2.frames : void 0 : void 0 : void 0) {
        results = [];
        for (i = 0, len = frames.length; i < len; i++) {
          frame = frames[i];
          results.push(frame.filename = frame.filename.replace(GLOBALS.APP_ROOT, GLOBALS.ROLLBAR_SOURCEMAPS_URL_PREFIX + "/"));
        }
        return results;
      }
    }
  });

  app.run(function(Auth) {
    return Auth.on("user.updated", function(user) {
      return Rollbar.configure({
        payload: {
          person: (user ? {
            id: user.id,
            email: user.email
          } : void 0)
        }
      });
    });
  });

  app.run(function(onRouteChangeCallback) {
    return onRouteChangeCallback(function(state) {
      return Rollbar.configure({
        payload: {
          context: state.name
        }
      });
    });
  });

}).call(this);

(function() {
  if (GLOBALS.WEINRE_ADDRESS && (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) && !navigator.platform.match(/MacIntel/i)) {
    window.addElement(document, "script", {
      id: "weinre-js",
      src: "http://" + GLOBALS.WEINRE_ADDRESS + "/target/target-script-min.js#anonymous"
    });
  }

}).call(this);

(function() {
  var app;

  app = angular.module(GLOBALS.ANGULAR_APP_NAME);

  app.run(function($window, $injector) {
    return $window.$a = $injector.get;
  });

}).call(this);


/**
 * Wraps ng-cloak so that, instead of simply waiting for Angular to compile, it waits until
 * Auth resolves with the remote Firebase services.
#
 * <code>
 *    <div ng-cloak>Authentication has resolved.</div>
 * </code>
 */

(function() {
  angular.module('songaday').config([
    '$provide', function($provide) {
      $provide.decorator('ngCloakDirective', [
        '$delegate', 'Auth', function($delegate, Auth) {
          var _compile, directive;
          directive = $delegate[0];
          _compile = directive.compile;
          directive.compile = function(element, attr) {
            Auth.$waitForAuth().then(function() {
              _compile.call(directive, element, attr);
            });
          };
          return $delegate;
        }
      ]);
    }
  ]);

}).call(this);

(function() {
  angular.module('songaday').directive('comments', function() {
    return {
      compile: function(tElem, tAttrs) {
        tElem.append('<div another-directive></div>');
        return function(scope, iElem, iAttrs) {
          iElem.append('<div another-directive></div>');
        };
      }
    };
  });

}).call(this);

(function() {
  angular.module('songaday').directive('enterSubmit', function() {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        elem.bind('keyup', function(event) {
          var code;
          code = event.keyCode || event.which;
          if (code === 13) {
            if (!event.shiftKey) {
              event.preventDefault();
              scope.$apply(attrs.enterSubmit);
            }
          }
        });
        if (ionic.Platform.isIOS()) {
          elem.bind('blur', function(event) {
            scope.$apply(attrs.enterSubmit);
          });
        }
      }
    };
  });

}).call(this);

(function() {
  angular.module('songaday').directive('errSrc', function() {
    return {
      link: function(scope, element, attrs) {
        element.bind('error', function() {
          if (attrs.src !== attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    };
  });

}).call(this);

(function() {
  angular.module('songaday').directive('loader', function() {
    return {
      template: '{{loading?"☕":""}}'
    };
  });

}).call(this);

(function() {
  angular.module('songaday').directive('showWhen', function($window) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attr) {
        var checkExpose, debouncedCheck, onResize;
        debouncedCheck = ionic.debounce((function() {
          $scope.$apply(function() {
            checkExpose();
          });
        }), 300, false);
        checkExpose = function() {
          var mq;
          mq = $attr.showWhen === 'large' ? '(min-width:768px)' : '(max-width:768px)';
          if ($window.matchMedia(mq).matches) {
            $element.removeClass('ng-hide');
          } else {
            $element.addClass('ng-hide');
          }
        };
        onResize = function() {
          debouncedCheck();
        };
        checkExpose();
        ionic.on('resize', onResize, $window);
        $scope.$on('$destroy', function() {
          ionic.off('resize', onResize, $window);
        });
      }
    };
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("Auth", function($firebaseAuth, FBURL) {
    return $firebaseAuth(new Firebase(FBURL));
  });

}).call(this);

(function() {
  angular.module("songaday").factory('FormFactory', function($q) {

    /*
    Basic form class that you can extend in your actual forms.

    Object attributes:
    - loading[Boolean] - is the request waiting for response?
    - message[String] - after response, success message
    - errors[String[]] - after response, error messages

    Options:
      - submitPromise[function] (REQUIRED) - creates a form request promise
      - onSuccess[function] - will be called on succeded promise
      - onFailure[function] - will be called on failed promise
     */
    var FormFactory;
    return FormFactory = (function() {
      function FormFactory(options) {
        this.options = options != null ? options : {};
        this.loading = false;
      }

      FormFactory.prototype.submit = function() {
        if (!this.loading) {
          return this._handleRequestPromise(this._createSubmitPromise());
        }
      };

      FormFactory.prototype._onSuccess = function(response) {
        this.message = response.message || response.success;
        return response;
      };

      FormFactory.prototype._onFailure = function(response) {
        var ref, ref1, ref2, ref3, ref4;
        this.errors = ((ref = response.data) != null ? (ref1 = ref.data) != null ? ref1.errors : void 0 : void 0) || ((ref2 = response.data) != null ? ref2.errors : void 0) || [((ref3 = response.data) != null ? ref3.error : void 0) || response.error || ((ref4 = response.data) != null ? ref4.message : void 0) || response.message || "Something has failed. Try again."];
        return $q.reject(response);
      };

      FormFactory.prototype._createSubmitPromise = function() {
        return this.options.submitPromise();
      };

      FormFactory.prototype._handleRequestPromise = function($promise, onSuccess, onFailure) {
        this.$promise = $promise;
        this.loading = true;
        this.submitted = false;
        this.message = null;
        this.errors = [];
        this.$promise.then((function(_this) {
          return function(response) {
            _this.errors = [];
            _this.submitted = true;
            return response;
          };
        })(this)).then(_.bind(this._onSuccess, this)).then(onSuccess || this.options.onSuccess)["catch"](_.bind(this._onFailure, this))["catch"](onFailure || this.options.onFailure)["finally"]((function(_this) {
          return function() {
            return _this.loading = false;
          };
        })(this));
        return this.$promise;
      };

      return FormFactory;

    })();
  });

}).call(this);

(function() {
  var slice = [].slice;

  angular.module("songaday").factory('ObserverFactory', function($rootScope) {
    var ObserverFactory;
    return ObserverFactory = (function() {
      function ObserverFactory() {}

      ObserverFactory.prototype.on = function(eventName, listener) {
        var base;
        if (this.listeners == null) {
          this.listeners = {};
        }
        if ((base = this.listeners)[eventName] == null) {
          base[eventName] = [];
        }
        return this.listeners[eventName].push(listener);
      };

      ObserverFactory.prototype.once = function(eventName, listener) {
        listener.__once__ = true;
        return this.on(eventName, listener);
      };

      ObserverFactory.prototype.off = function(eventName, listener) {
        var i, j, len, ref, ref1, results, v;
        if (!((ref = this.listeners) != null ? ref[eventName] : void 0)) {
          return;
        }
        if (!listener) {
          return delete this.listeners[eventName];
        }
        ref1 = this.listeners[eventName];
        results = [];
        for (v = j = 0, len = ref1.length; j < len; v = ++j) {
          i = ref1[v];
          if (this.listeners[eventName] === listener) {
            this.listeners.splice(i, 1);
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      ObserverFactory.prototype.fireEvent = function() {
        var eventName, j, len, params, ref, ref1, ref2, v;
        eventName = arguments[0], params = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        if (!((ref = this.listeners) != null ? (ref1 = ref[eventName]) != null ? ref1.length : void 0 : void 0)) {
          return;
        }
        ref2 = this.listeners[eventName];
        for (j = 0, len = ref2.length; j < len; j++) {
          v = ref2[j];
          v.apply(this, params);
          if (v.__once__) {
            this.off(eventName, v);
          }
        }
        if (!$rootScope.$$phase) {
          return $rootScope.$apply();
        }
      };

      return ObserverFactory;

    })();
  });

}).call(this);

(function() {
  angular.module("songaday").factory('PromiseFactory', function($q) {
    var constructor;
    return constructor = function(value, resolve) {
      var deferred;
      if (resolve == null) {
        resolve = true;
      }
      if ((value != null) && typeof (value != null ? value.then : void 0) === 'function') {
        return value;
      } else {
        deferred = $q.defer();
        if (resolve) {
          deferred.resolve(value);
        } else {
          deferred.reject(value);
        }
        return deferred.promise;
      }
    };
  });

}).call(this);

(function() {
  angular.module('songaday').filter('length', function() {
    return function(item) {
      return Object.keys(item || {}).length;
    };
  });

}).call(this);

(function() {
  angular.module('songaday').filter('trust', function($sce) {
    return function(url) {
      if (url) {
        return $sce.trustAsResourceUrl(url);
      }
    };
  });

}).call(this);

(function() {
  Array.prototype.last = function(n) {
    n = typeof n !== 'undefined' ? n : 1;
    return this[this.length - n];
  };

}).call(this);

(function() {


}).call(this);

(function() {
  angular.module("songaday").controller("AccountCtrl", function($scope, $stateParams, AccountService, SongService, TransmitService) {
    console.log('ACCOUNT');
    $scope.limit = 7;
    $scope.offset = 0;
    $scope.didReachEnd = false;
    $scope.awsParamsURI = TransmitService.awsParamsURI();
    $scope.awsFolder = TransmitService.awsFolder();
    $scope.s3Bucket = TransmitService.s3Bucket();

    $scope.loadMore = function() {
      console.log('in the loadMore');
      if (!$scope.didReachEnd){
        if (!$scope.loading){ $scope.loading = true;}
        $scope.offset++;
        SongService.getListWithLimit($scope.limit * $scope.offset, $scope.me.$id, function(songs) {
          $scope.songs = songs;
          console.log('here is the callback');
          console.log($scope.songs);
          if ($scope.songs.length === Object.keys($scope.me.songs).length ){ $scope.didReachEnd = true;}
          $scope.loading = false;
        });
      }
    }; 

    $scope.loadAll = function() {
      if (!$scope.didReachEnd){
        if (!$scope.loading){
          $scope.loading = true;
        }
        $scope.songs = SongService.getList($scope.me.songs);
         $scope.songs[$scope.songs.length - 1].$loaded(function() {
            $scope.loading = false;
            $scope.didReachEnd = true;
          });
        }
    };

    AccountService.refresh(function(myself) {
      $scope.me = myself;
      myself.$bindTo($scope, 'me');
      return $scope.loadMore();
    });
    return $scope.propogate = function() {
      var i, len, ref, results, song;
      ref = $scope.songs;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        song = ref[i];
        song.artist.alias = $scope.me.alias;
        song.artist.avatar = $scope.me.avatar;
        results.push(song.$save());
      }
      return results;
    };
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("AccountService", function($rootScope, $firebaseArray, $firebaseObject, Auth, FBURL) {
    var loading, me, ref;
    ref = new Firebase(FBURL);
    loading = true;
    me = {};
    return {
      loggedIn: function() {
        return console.log(auth);
      },
      refresh: function(cb) {
        return Auth.$waitForAuth().then(function(authObject) {
          var my_id;
          if (authObject === null || typeof authObject.google === 'undefined') {
            console.log("NOT LOGGED IN");
            return;
          }
          my_id = CryptoJS.SHA1(authObject.google.email).toString().substring(0, 11);
          me = $firebaseObject(ref.child('artists/' + my_id));
          me.$loaded(function() {
            if (!me['user_id']) {
              ref.child('artists').child(my_id).child('user_id').set(authObject.uid);
            }
            if (!me['email']) {
              return ref.child('artists').child(my_id).child('email').set(authObject.google.email);
            }
          });
          $rootScope.notifications = $firebaseArray(ref.child('notices/' + my_id));
          $rootScope.notifications.$loaded(function() {
            return console.log($rootScope.notifications);
          });
          return me.$loaded(function() {
            console.log(me);
            return cb(me);
          });
        });
      },
      mySelf: function() {
        return me;
      },
      remove_song: function(song, cb) {
        var last_song_ref, last_song_uri, song_ref, song_uri;
        song_uri = FBURL + '/artists/' + me.$id + '/songs/' + song.$id;
        last_song_uri = FBURL + '/artists/' + me.$id + '/last_transmission/';
        song_ref = new Firebase(song_uri);
        last_song_ref = new Firebase(last_song_uri);
        song_ref.remove();
        last_song_ref.remove();
        song.$remove();
        return cb();
      },
      logout: function() {
        return Auth.$unauth();
      },
      login: function() {
        var provider;
        provider = 'google';
        return Auth.$authWithOAuthPopup(provider, {
          scope: "email"
        }).then((function(authObject) {
          var my_id;
          my_id = CryptoJS.SHA1(authObject.google.email).toString().substring(0, 11);
          me = $firebaseObject(ref.child('artists/' + my_id));
        }), function(error) {
          console.log(error);
        });
      }
    };
  });

}).call(this);

(function() {


}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("AudioContextService", function($window) {
    var context, nodes;
    nodes = {};
    context = new ($window.AudioContext || $window.webkitAudioContext)();
    return {
      getContext: function() {
        return context;
      },
      getAudioContext: function() {
        return context;
      }
    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("AppCtrl", function($sce, SongService, AccountService, $state, $rootScope, $scope, $ionicSideMenuDelegate, $stateParams, $timeout, ListenService, AudioVisualizerService, $window) {
    var ctrl;
    ctrl = this;
    ctrl.state = null;
    ctrl.API = null;
    ctrl.currentSong = 0;
    ctrl.currentMediaType = "audio";
    ctrl.playlist = [];
    ctrl.playlistMode = false;
    ctrl.nowPlaying = {
      "$id": ""
    };
    ctrl.toggleAside = function() {
      return ctrl.playlistMode = true;
    };
    $timeout((function() {
      return ionic.trigger('resize');
    }), 100);
    $rootScope.songIsPlaying = function(song) {
      var isPlaying;
      isPlaying = ctrl.nowPlaying.$id === song.$id;
      return isPlaying;
    };
    $rootScope.toggleLeft = function() {
      return $ionicSideMenuDelegate.toggleLeft();
    };
    $rootScope.comment = function(song, comment_text) {
      return AccountService.refresh(function(myself) {
        var comment;
        comment = {
          comment: comment_text,
          author: {
            alias: myself.alias,
            avatar: myself.avatar,
            key: myself.$id
          }
        };
        SongService.comment(song, comment);
        return comment_text = "";
      });
    };
    $rootScope.showNotification = function(notice) {
      var songID;
      songID = notice.link.toString().replace('song/', "");
      $state.go('app.song-detail', {
        songId: songID
      });
      return $rootScope.notifications.$remove(notice);
    };
    $rootScope.login = function() {
      return AccountService.login();
    };
    $rootScope.logout = function() {
      return AccountService.logout();
    };
    $rootScope.showArtist = function(artist) {
      if (typeof artist === 'string') {
        $state.go('app.artist-detail', {
          artistId: artist
        });
        return;
      }
      return $state.go('app.artist-detail', {
        artistId: artist.$id
      });
    };
    $rootScope.showSong = function(song) {
      return $state.go('app.song-detail', {
        songId: song.$id
      });
    };
    $rootScope.showPlaylist = function(playlist) {
      return $state.go('app.playlist-detail', {
        playlistId: playlist.$id
      });
    };
    $scope.showNowPlaying = function() {
      return $state.go('app.song-detail', {
        songId: ctrl.nowPlaying.$id
      });
    };
    ctrl.next = function() {
      ctrl.currentSong++;
      if (ctrl.currentSong >= ctrl.playlist.length) {
        ctrl.currentSong = 0;
      }
      return ctrl.setNowPlaying(ctrl.currentSong);
    };
    ctrl.previous = function() {
      ctrl.currentSong--;
      if (ctrl.currentSong < 0) {
        ctrl.currentSong = ctrl.playlist.length;
      }
      return ctrl.setNowPlaying(ctrl.currentSong);
    };
    $rootScope.play = function(song) {
      if (ctrl.playlist.indexOf(song) === ctrl.currentSong) {
        return;
      }
      if (!_(ctrl.playlist).includes(song)) {
        ctrl.playlist.push(song);
        return ctrl.setNowPlaying(_.indexOf(ctrl.playlist, song));
      } else {
        return ctrl.setNowPlaying(_.indexOf(ctrl.playlist, song));
      }
    };
    $rootScope.stop = function() {
      return ctrl.API.stop();
    };
    $rootScope.currentQueue = function() {
      return ctrl.playlist;
    };
    $rootScope.clearQueue = function() {
      ctrl.API.stop();
      return ctrl.playlist = [];
    };
    $rootScope.enQueue = function(song) {
      if (_(ctrl.playlist).includes(song)) {
        return;
      }
      ctrl.playlist.push(song);
      if (ctrl.playlist.length === 1) {
        return ctrl.setNowPlaying(0);
      }
    };
    $rootScope.queue = function(song) {
      if (_(ctrl.playlist).includes(song)) {
        ctrl.setNowPlaying(_.indexOf(ctrl.playlist, song));
        return;
      }
      ctrl.playlist.push(song);
      if (ctrl.playlist.length === 1) {
        return ctrl.setNowPlaying(0);
      }
    };

    ctrl.setNewPosition = function($event){
      currentTime = (event.offsetX / $window.innerWidth) * ctrl.API.totalTime;
      ctrl.API.seekTime(currentTime/1000, false);
    };

    ctrl.onPlayerReady = function(API) {
      ctrl.API = API;
    };
    ctrl.config = {
      preload: 'none',
      sources: [
        {
          media: "/audio/startup.mp3",
          type: "audio/mp3"
        }
      ]
    };
    ctrl.remove = function(index) {
      if (ctrl.currentSong === index) {
        ctrl.next();
      }
      ctrl.playlist.splice(index, 1);
      return $scope.$apply();
    };
    ctrl.moveSong = function(song, fromIndex, toIndex) {
      if (ctrl.currentSong === fromIndex) {
        ctrl.currentSong = toIndex;
      }
      ctrl.playlist.splice(fromIndex, 1);
      $scope.$apply();
      ctrl.playlist.splice(toIndex, 0, song);
      $scope.$apply();
    };
    ctrl.setNowPlaying = function(index) {
      var m;
      try {
        ctrl.API.stop();
      } catch (_error) {
        console.log('ERR');
      }
      ctrl.currentSong = index;
      ctrl.nowPlaying = ctrl.playlist[index];
      ListenService.listen(ctrl.nowPlaying);
      m = ctrl.playlist[index].media;
      ctrl.config.sources = [
        {
          src: $sce.trustAsResourceUrl(m.src),
          type: m.type
        }
      ];
      $timeout((function() {
        ctrl.API.play();
        if (_(m.type).contains('video')) {
          if (!ctrl.API.isFullScreen) {
            ctrl.API.toggleFullScreen();
          }
        }
        if (_(m.type).contains('audio')) {
          if (ctrl.API.isFullScreen) {
            return ctrl.API.toggleFullScreen();
          }
        }
      }), 200);
    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("ArtistDetailCtrl", function($scope, $stateParams, SongService, ArtistService, Auth, $firebaseArray, FBURL) {
    $scope.artist = ArtistService.get($stateParams.artistId);
    $scope.limit = 7;
    $scope.offset = 0;
    $scope.didReachEnd = false;
    $scope.loading = true;
    $scope.loggedIn = true;
    $scope.loadMore = function() {
      if (!$scope.didReachEnd){
        if (!$scope.loading){ $scope.loading = true;}
        $scope.offset++;
        SongService.getListWithLimit($scope.limit * $scope.offset, $scope.artist.$id, function(songs) {
          $scope.songs = songs;
          console.log(songs, 'songs');
          if ($scope.songs.length === Object.keys($scope.artist.songs).length ){ $scope.didReachEnd = true;}
          $scope.loading = false;
        });
      }
    };

    $scope.loadAll = function() {
      if (!$scope.didReachEnd){
        if (!$scope.loading){
          $scope.loading = true;
        }
        $scope.songs = SongService.getList($scope.artist.songs);
         $scope.songs[$scope.songs.length - 1].$loaded(function() {
            $scope.loading = false;
            $scope.didReachEnd = true;
          });
        }
    };

    return $scope.artist.$loaded(function(value) {
          $scope.loadMore();
          return true;
    }, function(error){
      if (error.message.indexOf('permission_denied') > -1){
        $scope.loggedIn = false;
        return $scope.loading = false;
      } else {
        $scope.loading = false;
        return alert('something went wrong!');
    }
    });      
  })
}).call(this);

(function() {
  angular.module("songaday").controller("ArtistIndexCtrl", function($scope, $state, ArtistService) {
    $scope.artists = ArtistService.some();
    $scope.loading = true;
    return $scope.artists.$loaded(function() {
      return $scope.loading = false;
    });
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("ArtistService", function($firebaseObject, $firebaseArray, FBURL) {
    var artists, ref;
    ref = new Firebase(FBURL + '/public_artists').orderByPriority();
    this.loading = true;
    artists = $firebaseArray(ref);
    return {
      some: function() {
        console.log('in some');
        artists.$loaded(function() {
          return this.loading = false;
        });
        return artists;
      },
      get: function(artistId) {
        var artist;
        ref = new Firebase(FBURL + '/artists/' + artistId);
        artist = $firebaseObject(ref);
        return artist;
      }
    };
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("BetaService", function($firebaseArray, Auth, FBURL) {
    var ref;
    ref = new Firebase(FBURL + 'beta');
    return {
      addMe: function() {
        console.log('MASD');
        return Auth.$waitForAuth().then(function(authObject) {
          var betas;
          if (typeof authObject.google.email !== 'undefined') {
            betas = $firebaseArray(ref);
            console.log('MASD');
            betas.$add(authObject.google.email);
            betas.$save();
            return alert('Check your' + authObject.google.email + ' email tommorow ;)');
          }
        });
      }
    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("ListenCtrl", function($scope, ListenService, SongService) {
    console.log('LISTENS');
    $scope.listens = ListenService.getListens();
    return $scope.listens.$loaded(function(l) {
      delete l.$priority;
      delete l.$id;
      delete l.$$conf;
      console.log('loaded', l);
      return $scope.songs = SongService.getList(l);
    });
  });

}).call(this);

(function() {
  angular.module("songaday").factory("ListenService", function(FBURL, $firebaseObject) {
    var ref;
    ref = new Firebase(FBURL + 'listens');
    return {
      listen: function(song) {
        return ref.child(song.$id).transaction(function(current_value) {
          return current_value = (current_value || 0) + 1;
        });
      },
      getListens: function() {
        return $firebaseObject(ref);
      }
    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("PlayerCtrl", function($scope, $stateParams, SongService) {
    $scope.next(function() {
      return console.log("next");
    });
    $scope.previous(function() {
      return console.log("prev");
    });
    $scope.stop(function() {
      return console.log("stop");
    });
    $scope.pause(function() {
      return console.log("pause");
    });
    return $scope.play(function() {
      return console.log("play");
    });
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("PlayerService", function() {
    var currentIndex, playlist;
    playlist = [];
    currentIndex = 0;
    return {
      nowPlaying: function() {
        return playlist[currentIndex];
      },
      listen: function(song) {
        return playlist.push(song.media);
      },
      getPlaylist: function() {
        return playlist;
      }
    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("PlaylistDetailCtrl", function($rootScope, $scope, $stateParams, SongService, PlaylistService) {
    $scope.loading = true;
    $scope.playlist = PlaylistService.get($stateParams.playlistId);
    $scope.playlist.$loaded(function() {
      $scope.loading = false;
      return $scope.songs = SongService.getList($scope.playlist.songs);
    });
    return $scope.playAll = function() {
      console.log('in the play');
      var i, len, ref, results, song;
      ref = $scope.songs;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        song = ref[i];
        results.push($rootScope.queue(song));
      }
      return results;
    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("PlaylistIndexCtrl", function($state, $rootScope, $ionicModal, $scope, PlaylistService, SongService) {
    $scope.playlists = PlaylistService.some();
    $scope.loading = true;
    $scope.playlists.$loaded(function() {
      $scope.loading = false;
      return console.log($scope.playlists);
    });
    $ionicModal.fromTemplateUrl('templates/playlist-new-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      return $scope.modal = modal;
    });
    $scope.loadMore = function() {
      $scope.loading = true;
      return SongService.more(function() {
        return $scope.loading = false;
      });
    };
    $scope.playlist;
    return $scope.savePlaylist = function(newTitle) {
      var i, len, playlist, ref, song;
      $scope.modal.hide();
      playlist = {
        title: newTitle
      };
      playlist['timestamp'] = (new Date()).toISOString();
      playlist.songs = {};
      playlist.count = 0;
      ref = $rootScope.currentQueue();
      for (i = 0, len = ref.length; i < len; i++) {
        song = ref[i];
        playlist.songs[song.$id] = true;
        playlist.count += 1;
      }
      return PlaylistService["new"](playlist);
    };
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("PlaylistService", function($firebaseObject, $firebaseArray, SongService, FBURL) {
    var limit, playlists, ref;
    limit = 7;
    ref = new Firebase(FBURL + '/playlists');
    playlists = $firebaseArray(ref);
    return {
      some: function() {
        return playlists;
      },
      get: function(playlistId) {
        ref = new Firebase(FBURL + '/playlists/' + playlistId);
        return $firebaseObject(ref);
      },
      "new": function(playlist) {
        return playlists.$add(playlist);
      }
    };
  });

}).call(this);

(function() {


}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("MultiTrackService", function() {
    var limit, tracks;
    limit = 7;
    tracks = [];
    return {
      mix: function() {
        var i, len, mixDown, track;
        mixDown = "";
        for (i = 0, len = tracks.length; i < len; i++) {
          track = tracks[i];
          mixDown += track;
        }
        return tracks;
      }
    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("RecordCtrl", function($rootScope, $scope, $state, SongService, $window, AccountService, $stateParams, TransmitService, AudioContextService, RecordService, MultiTrackService, $ionicModal, BetaService, AudioVisualizerService) {
    var __log, audio_context, captureError, captureSuccess, export_wav, fetchFile, rec_ctrl, recorder, reset, startUserMedia;
    rec_ctrl = this;
    audio_context = {};
    $scope.transmission = {};
    $rootScope.file_type = "audio/mp3";
    $rootScope.file_ext = "mp3";
    $scope.transmitting = false;
    try {
      $rootScope.stop();
    } catch (_error) {}
    recorder = {};
    $rootScope.recording = false;
    $rootScope.recording_file_uri = false;
    TransmitService.lastTransmission(function(song) {
      var latest_date, today;
      console.log(song, 'ssss');
      latest_date = new Date(song.timestamp);
      today = new Date();
      if (today.getDate() === latest_date.getDate()) {
        $scope.song = song;
        return $scope.transmitted = true;
      }
    });
    $ionicModal.fromTemplateUrl('templates/record-help-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      return console.log(modal);
    });
    $scope.joinBeta = function() {
      return BetaService.addMe();
    };
    $scope.transmit = function() {
      __log('Uploading Compressed Audio');
      return AccountService.refresh(function(myself) {
        return TransmitService.uploadBlob($rootScope.file_blob, $rootScope.file_ext, function(file_uri) {
          var file_type, song;
          __log('Audio uploaded');
          song = {};
          file_type = $rootScope.file_type;
          song['media'] = {
            'src': file_uri,
            type: file_type
          };
          song['info'] = $scope.transmission.info || '~';
          song['title'] = $scope.transmission.title || 'untitled';
          song['user_id'] = myself.user_id;
          song['timestamp'] = (new Date()).toISOString();
          song['artist_timestamp'] = myself.$id + '_' +  song.timestamp,
          song['$priority'] = -1 * Date.parse(song.timestamp);
          song['artist'] = {
            'alias': myself.alias || '',
            'key': myself.$id,
            'avatar': myself.avatar || ''
          };
          return TransmitService.transmit(song, function(new_id) {
            var sng;
            __log('complete');
            sng = SongService.get(new_id);
            sng.$loaded(function() {
              return $scope.song = sng;
            });
            $scope.latestTransmission = song;
            $scope.transmitted = true;
            return $scope.transmitting = false;
          });
        });
      });
    };
    $rootScope.onCompleteEncode = function(e) {
      if ($rootScope.recording) {
        return;
      }
      __log('encoded.');
      $rootScope.file_blob = new Blob([new Uint8Array(e.data.buf)], {
        type: 'audio/mp3'
      });
      $scope.readyToTransmit = true;
      $rootScope.file_blob.name = $scope.title + '.mp3';
      return $scope.$apply();
    };
    reset = function() {
      $scope.transmitted = false;
      $scope.readyToTransmit = false;
      $scope.song = false;
      $rootScope.file_blob = null;
      $rootScope.wav_file_uri = null;
      __log('reset');
      if (!_(ionic.Platform.platforms).contains('browser')) {
        return $scope.startNativeRecording();
      }
    };
    $scope.revoke = function() {
      if ($scope.song) {
        return AccountService.remove_song($scope.song, function() {
          return reset();
        });
      }
    };
    fetchFile = function(fs) {
      return console.log(fs);
    };
    captureSuccess = function(mediaFiles) {
      var file_protocol;
      $window.file = mediaFiles[0];
      file_protocol = "file://";
      console.log($window.file, 'MEOW');
      return $window.resolveLocalFileSystemURI(file_protocol + file.fullPath, function(obj) {
        var file_URI;
        $rootScope["native"] = true;
        file_URI = obj.nativeURL;
        return obj.file(function(file_obj) {
          var reader;
          reader = new FileReader;
          reader.onload = function(evt) {
            var file_type;
            file_type = "audio/wav";
            $rootScope.file_blob = new Blob([new Uint8Array(this.result)], {
              type: file_type
            });
            $rootScope.file_type = file_type;
            $rootScope.wav_file_uri = file_URI;
            $rootScope.readyToTransmit = true;
            $scope.$apply();
          };
          return reader.readAsArrayBuffer(file_obj);
        });
      });
    };
    captureError = function(error) {
      navigator.notification.alert('Error: ' + error.code, null, 'Capture Error');
      __log(error);
    };
    __log = function(msg) {
      return $scope.message = msg;
    };
    $scope.startNativeRecording = function() {
      return navigator.device.capture.captureAudio(captureSuccess, captureError, {
        limit: 1
      });
    };
    startUserMedia = function(stream) {
      var input;
      input = audio_context.createMediaStreamSource(stream);
      __log('Media stream created.');
      __log('input sample rate ' + input.context.sampleRate);
      recorder = new RecordService.Recorder(input);
      __log(recorder);
      __log('Recorder initialised.');
    };
    $scope.showModal = function() {
      return alert('s');
    };
    $scope.tryHTML5Recording = function() {
      __log('init html5 recording');
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      if (typeof navigator.getUserMedia === 'undefined') {
        $scope.recording_not_supported = true;
        return;
      }
      window.URL = window.URL || window.webkitURL;
      audio_context = AudioContextService.getContext();
      __log('Audio context...');
      __log(navigator.getUserMedia ? 'ready.' : ':( sad browser!');
      return navigator.getUserMedia({
        audio: true
      }, startUserMedia, function(e) {
        __log('No live audio input: ' + e);
      });
    };
    export_wav = function() {
      return recorder && recorder.exportWAV(function(blob) {
        var fileReader;
        fileReader = new FileReader;
        fileReader.onload = function() {
          var arrayBuffer, binary, buffer, bytes, data, i, len;
          arrayBuffer = this.result;
          buffer = new Uint8Array(arrayBuffer);
          binary = '';
          bytes = new Uint8Array(buffer);
          len = bytes.byteLength;
          i = 0;
          while (i < len) {
            binary += String.fromCharCode(bytes[i]);
            i++;
          }
          data = window.btoa(binary);
          $rootScope.wav_file_uri = 'data:audio/wav;base64,' + data;
          return $scope.$apply();
        };
        fileReader.readAsArrayBuffer(blob);
        return recorder.clear();
      });
    };
    $scope.startRecording = function(button) {
      AudioVisualizerService.initialize();
      recorder && recorder.record();
      $rootScope.recording = true;
      __log('Recording...');
      $scope.readyToTransmit = false;
    };
    $scope.stopRecording = function(button) {
      AudioVisualizerService.$destroy();
      $rootScope.recording = false;
      recorder && recorder.stop();
      __log('Stopped recording.');
      export_wav();
      __log('encoding media...');
    };
    if (_(ionic.Platform.platforms).contains('browser')) {
      return $scope.tryHTML5Recording();
    } else {
      $scope.startNativeRecording();
      $rootScope.file_blob = void 0;
      $rootScope.wav_file_uri = void 0;
      return $rootScope.file_ext = "wav";
    }
  });

}).call(this);

(function() {
  angular.module('songaday').factory('RecordService', function($rootScope, $window, AudioContextService, $http) {
    var WORKER_PATH, encoderWorker;
    WORKER_PATH = 'js/recorderWorker.js';
    encoderWorker = new Worker('js/mp3Worker.js');
    return {
      Recorder: function(source, cfg) {
        var Uint8ArrayToFloat32Array, bufferLen, config, currCallback, encode64, parseWav, recording, uploadAudio, worker;
        config = cfg || {};
        bufferLen = config.bufferLen || 4096;
        encode64 = function(buffer) {
          var binary, bytes, i, len;
          binary = '';
          bytes = new Uint8Array(buffer);
          len = bytes.byteLength;
          i = 0;
          while (i < len) {
            binary += String.fromCharCode(bytes[i]);
            i++;
          }
          return window.btoa(binary);
        };
        parseWav = function(wav) {
          var readInt;
          readInt = function(i, bytes) {
            var ret, shft;
            ret = 0;
            shft = 0;
            while (bytes) {
              ret += wav[i] << shft;
              shft += 8;
              i++;
              bytes--;
            }
            return ret;
          };
          if (readInt(20, 2) !== 1) {
            throw 'Invalid compression code, not PCM';
          }
          if (readInt(22, 2) !== 1) {
            throw 'Invalid number of channels, not 1';
          }
          return {
            sampleRate: readInt(24, 4),
            bitsPerSample: readInt(34, 2),
            samples: wav.subarray(44)
          };
        };
        Uint8ArrayToFloat32Array = function(u8a) {
          var f32Buffer, i, value;
          f32Buffer = new Float32Array(u8a.length);
          i = 0;
          while (i < u8a.length) {
            value = u8a[i << 1] + (u8a[(i << 1) + 1] << 8);
            if (value >= 0x8000) {
              value |= ~0x7FFF;
            }
            f32Buffer[i] = value / 0x8000;
            i++;
          }
          return f32Buffer;
        };
        uploadAudio = function(mp3Data) {
          var reader;
          reader = new FileReader;
          reader.onload = function(event) {
            var fd, mp3Name;
            fd = new FormData;
            mp3Name = encodeURIComponent('audio_recording_' + (new Date).getTime() + '.mp3');
            console.log('mp3name = ' + mp3Name);
            fd.append('fname', mp3Name);
            fd.append('data', event.target.result);
            $.ajax({
              type: 'POST',
              url: 'upload.php',
              data: fd,
              processData: false,
              contentType: false
            }).done(function(data) {
              log.innerHTML += '\n' + data;
            });
          };
          reader.readAsDataURL(mp3Data);
        };
        this.context = source.context;
        this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context, bufferLen, 2, 2);
        worker = new Worker(config.workerPath || WORKER_PATH);
        worker.postMessage({
          command: 'init',
          config: {
            sampleRate: this.context.sampleRate
          }
        });
        recording = false;
        currCallback = void 0;
        this.node.onaudioprocess = function(e) {
          if (!recording) {
            return;
          }
          worker.postMessage({
            command: 'record',
            buffer: [e.inputBuffer.getChannelData(0)]
          });
        };
        this.configure = function(cfg) {
          var prop;
          for (prop in cfg) {
            if (cfg.hasOwnProperty(prop)) {
              config[prop] = cfg[prop];
            }
          }
        };
        this.record = function() {
          recording = true;
        };
        this.stop = function() {
          recording = false;
        };
        this.clear = function() {
          worker.postMessage({
            command: 'clear'
          });
        };
        this.getBuffer = function(cb) {
          currCallback = cb || config.callback;
          worker.postMessage({
            command: 'getBuffer'
          });
        };
        this.exportWAV = function(cb, type) {
          currCallback = cb || config.callback;
          type = type || config.type || 'audio/wav';
          if (!currCallback) {
            throw new Error('Callback not set');
          }
          worker.postMessage({
            command: 'exportWAV',
            type: type
          });
        };
        worker.onmessage = function(e) {
          var arrayBuffer, blob, fileReader;
          blob = e.data;
          arrayBuffer = void 0;
          fileReader = new FileReader;
          fileReader.onload = function() {
            var buffer, data;
            arrayBuffer = this.result;
            buffer = new Uint8Array(arrayBuffer);
            data = parseWav(buffer);
            console.log('Converting to Mp3');
            encoderWorker.postMessage({
              cmd: 'init',
              config: {
                mode: 3,
                channels: 1,
                samplerate: data.sampleRate,
                bitrate: data.bitsPerSample
              }
            });
            encoderWorker.postMessage({
              cmd: 'encode',
              buf: Uint8ArrayToFloat32Array(data.samples)
            });
            encoderWorker.postMessage({
              cmd: 'finish'
            });
            encoderWorker.onmessage = function(e) {
              if (e.data.cmd === 'data') {
                console.log('Done converting to Mp3');
                console.log($rootScope);
                $rootScope.onCompleteEncode(e);
              }
            };
          };
          fileReader.readAsArrayBuffer(blob);
          currCallback(blob);
        };
        source.connect($window.analyser);
        $window.analyser.connect(this.node);
        this.node.connect(this.context.destination);
        return $window.analyser.fftSize = 2048;
      }
    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("SongDetailCtrl", function($scope, $stateParams, SongService, $ionicLoading) {
    $ionicLoading.show({
      template: 'Loading...'
    });
    $scope.song = SongService.get($stateParams.songId);
    return $scope.song.$loaded(function() {
      return $ionicLoading.hide();
    });
  });

}).call(this);

(function() {
  angular.module("songaday").controller("SongIndexCtrl", function($state, $scope, SongService) {
    $scope.songs = SongService.some();
    $scope.loading = true;
    $scope.songs.$loaded(function() {
      console.log('done loading');
      return $scope.loading = false;
    });
    $scope.loadMore = function() {
      $scope.loading = true;
      return SongService.more(function() {
        return $scope.loading = false;
      });
    };
    return $scope.playAll = function() {
      var i, len, ref, results, song;
      ref = $scope.songs;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        song = ref[i];
        results.push($scope.enQueue(song));
      }
      return results;
    };
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("SongService", function($firebaseObject, $firebaseArray, AccountService, FBURL) {
    var limit, ref, scroll, scrollRef, songs;
    limit = 7;
    ref = new Firebase(FBURL + 'songs');
    scrollRef = new Firebase.util.Scroll(ref, '$priority');
    scroll = scrollRef.scroll;
    songs = $firebaseArray(scrollRef);
    return {
      some: function() {
        this.more();
        return songs;
      },
      more: function(cb) {
        scroll.next(limit);
        if (cb) {
          return cb();
        }
      },
      comment: function(song, comment) {
        var comments, commentsRef, notices, noticesRef, notification;
        commentsRef = new Firebase(FBURL + 'songs/' + song.$id + '/comments');
        comments = $firebaseArray(commentsRef);
        comments.$add(comment);
        console.log(comment);
        noticesRef = new Firebase(FBURL + 'notices/' + song.artist.key);
        notices = $firebaseArray(noticesRef);
        notification = {};
        return notices.$loaded(function() {
          notification.message = comment.author.alias + ' commented on your song ' + song.title;
          notification.link = song.$id;
          notification.author = comment.author;
          notices.$add(notification);
          return comment = {};
        });
      },
      get: function(songId) {
        ref = new Firebase(FBURL + '/songs/' + songId);
        return $firebaseObject(ref);
      },
      getLimit: function(artistId, limit) {
         ref= new Firebase(FBURL + 'songs');
         query = ref.orderByChild("artist_timestamp")
               .startAt(artistId)
               .endAt(artistId+'_9999') //only will give most recent songs assumming that it is before year 9999
               .limitToLast(limit);
          return $firebaseArray(query);
      },
       getList: function(songList, callback) {
        var i, len, playlist, song, songId, songsInOrder;
        playlist = [];
        songsInOrder = Object.keys(songList).reverse();
        for (i = 0, len = songsInOrder.length; i < len; i++) {
          songId = songsInOrder[i];
          song = this.get(songId);
          playlist.push(song);
          if (typeof callback === 'function') {
            song.$loaded(callback);
          }
        }
        return playlist;
      },
      getListWithLimit: function(limit, artistId, callback) {
        var i, len, playlist, song, songId, songsInOrder;
        playlist = [];

        songsArray = this.getLimit(artistId, limit);
        songsArray.$loaded(function() {
              angular.forEach(songsArray, function(value, key) {
            playlist.push(value);
       });

       return callback(playlist);
     });



      }

    };
  });

}).call(this);

(function() {
  angular.module("songaday").controller("TransmitCtrl", function($scope, SongService, TransmitService, $state, $timeout, AccountService) {
    var reset;
    $scope.awsParamsURI = TransmitService.awsParamsURI();
    $scope.awsFolder = TransmitService.awsFolder();
    $scope.s3Bucket = TransmitService.s3Bucket();
    $scope.transmission = {
      media: {}
    };
    reset = function() {
      $scope.transmitted = false;
      $scope.ready = false;
      return $scope.song = false;
    };
    $scope.revoke = function() {
      if ($scope.song) {
        return AccountService.remove_song($scope.song, function() {
          return reset();
        });
      }
    };
    reset();
    TransmitService.lastTransmission(function(song) {
      var latest_date, today;
      latest_date = new Date(song.timestamp);
      today = new Date();
      if (today.getDate() === latest_date.getDate()) {
        $scope.song = song;
        return $scope.transmitted = true;
      }
    });
    $scope.$on('s3upload:success', function(e) {
      $scope.ready = true;
      $timeout((function() {
        $scope.transmission.media.src = e.targetScope['filename'];
        return $scope.transmission.media.type = e.targetScope['filetype'];
      }), 100);
      $timeout((function() {
        return $scope.transmit();
      }), 1000);
    });
    return $scope.transmit = function(song) {
      $scope.transmitting = true;
      return AccountService.refresh(function(myself) {
        song = {};
        song['info'] = $scope.transmission.info || '';
        song['title'] = $scope.transmission.title || '~untitled';
        song['media'] = $scope.transmission.media;
        song['user_id'] = myself.user_id;
        song['timestamp'] = (new Date()).toISOString();
        song['artist_timestamp'] = myself.$id + '_' +  song.timestamp,
        song['$priority'] = -1 * Date.parse(song.timestamp);
        song['artist'] = {
          'alias': myself.alias || '',
          'key': myself.$id,
          'avatar': myself.avatar || ''
        };
        console.log('about to call transmit service');
        return TransmitService.transmit(song, function(new_id) {
          var sng;
          $scope.transmitted = true;
          sng = SongService.get(new_id);
          return sng.$loaded(function() {
            return $scope.song = sng;
          });
        });
      });
    };
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("TransmitService", function($rootScope, $firebaseObject, $firebaseArray, FBURL, S3Uploader, ngS3Config, SongService, AccountService) {
    var ref;
    ref = new Firebase(FBURL + 'songs').limit(4);
    return {
      cloudFrontURI: function() {
        return 'https://s3-us-west-2.amazonaws.com/songadays/';
      },
      awsParamsURI: function() {
        return '/config/aws.json';
      },
      awsFolder: function() {
        return 'songs/';
      },
      s3Bucket: function() {
        return 'songadays';
      },
      transmit: function(song, callback) {
        var songs;
        songs = SongService.some();
        songs.$loaded(function() {
          return AccountService.refresh(function(me) {
            return songs.$add(song).then(function(new_ref) {
              console.log('in callback of transmit');
              var new_id;
              new_id = new_ref.key();
              if (typeof me.songs === 'undefined') {
                me.songs = {};
              }
              me.songs[new_id] = true;
              me.last_transmission = new_id;
              me.$save().then(function(res) {
                var publicRef = new Firebase(FBURL + 'public_artists').child(me.$id);
                publicRef.child('songCount').set(Object.keys(me.songs).length);
                publicRef.$save().then(function(res){
                   return callback(new_id);
                });
              });
            });
          });
        });
      },
      lastTransmission: function(callback) {
        return AccountService.refresh(function(myself) {
          var last_transmission;
          ref = new Firebase(FBURL + '/songs/' + myself.last_transmission);
          last_transmission = $firebaseObject(ref);
          return last_transmission.$loaded(function(err) {
            if (callback) {
              return callback(last_transmission);
            }
          });
        });
      },
      uploadBlob: function(blob, file_ext, callback) {
        var awsParams, cloudFront, key, opts, s3Options, s3Uri;
        cloudFront = this.cloudFrontURI();
        s3Uri = 'https://' + this.s3Bucket() + '.s3.amazonaws.com/';
        awsParams = this.awsParamsURI();
        s3Options = {
          'policy': 'ewogICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogInNvbmdhZGF5cyJ9LAogICAgWyJzdGFydHMtd2l0aCIsICIka2V5IiwgIiJdLAogICAgeyJhY2wiOiAicHJpdmF0ZSJ9LAogICAgWyJzdGFydHMtd2l0aCIsICIkQ29udGVudC1UeXBlIiwgIiJdLAogICAgWyJzdGFydHMtd2l0aCIsICIkZmlsZW5hbWUiLCAiIl0sCiAgICBbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwgMCwgNTI0Mjg4MDAwXQogIF0KfQ==',
          'signature': 'r+Ci1HbYn4fkyFB0pxwRWx5m0Ss=',
          'key': 'AKIAJ7K34ZKXEV72GYRQ'
        };
        console.log(file_ext);
        blob.type = 'audio/' + file_ext;
        key = s3Options.folder + (new Date()).getTime() + '-' + S3Uploader.randomString(16) + '.' + file_ext;
        opts = angular.extend({
          submitOnChange: true,
          getOptionsUri: awsParams,
          getManualOptions: null,
          acl: 'private',
          uploadingKey: 'uploading',
          folder: 'songs/',
          enableValidation: true,
          targetFilename: null
        }, opts);
        return S3Uploader.upload($rootScope, s3Uri, key, opts.acl, blob.type, s3Options.key, s3Options.policy, s3Options.signature, blob).then(function(obj) {
          callback(cloudFront + key);
        });
      }
    };
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("songaday").factory("AudioVisualizerService", function($window, AudioContextService) {
    var analyser, context;
    context = AudioContextService.getContext();
    analyser = context.createAnalyser();
    $window.analyser = analyser;
    return {
      getAnalyser: function() {
        return analyser;
      },
      $destroy: function() {
        var HEIGHT, WIDTH, canvas, canvasCtx;
        canvas = document.getElementById('visualizer');
        WIDTH = canvas.clientWidth;
        HEIGHT = canvas.clientHeight;
        canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        return window.cancelAnimationFrame($window.drawVisual);
      },
      initialize: function() {
        var HEIGHT, WIDTH, canvas, canvasCtx;
        canvas = document.getElementById('visualizer');
        WIDTH = canvas.clientWidth;
        HEIGHT = canvas.clientHeight;
        canvasCtx = canvas.getContext('2d');
        $window.drawVisualizer = function() {
          var bufferLength, i, sliceWidth, timeBuffer, v, x, y;
          $window.drawVisual = requestAnimationFrame(window.drawVisualizer);
          bufferLength = $window.analyser.frequencyBinCount;
          timeBuffer = new Uint8Array(bufferLength);
          $window.analyser.getByteTimeDomainData(timeBuffer);
          canvasCtx.fillStyle = 'rgba(200, 200, 200,0)';
          canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
          canvasCtx.lineWidth = 1;
          canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
          canvasCtx.beginPath();
          sliceWidth = WIDTH * 1.0 / bufferLength;
          x = 0;
          i = 0;
          while (i < bufferLength) {
            v = timeBuffer[i] / 128.0;
            y = v * HEIGHT / 2;
            if (i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
            i++;
          }
          canvasCtx.lineTo(canvas.width, canvas.height / 2);
          canvasCtx.stroke();
        };
        return $window.drawVisualizer();
      }
    };
  });

  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();

}).call(this);

(function() {
  angular.module("songaday").config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("app", {
      url: "",
      abstract: true,
      templateUrl: "templates/menu.html"
    }).state("app.songs", {
      url: "/songs",
      views: {
        "main-content": {
          templateUrl: "templates/song-index.html",
          controller: "SongIndexCtrl"
        }
      }
    }).state("app.song-detail", {
      url: "/song/:songId",
      views: {
        "main-content": {
          templateUrl: "templates/song-detail.html",
          controller: "SongDetailCtrl"
        }
      }
    }).state("app.artists", {
      url: "/songwriters",
      views: {
        "main-content": {
          templateUrl: "templates/artist-index.html",
          controller: "ArtistIndexCtrl"
        }
      }
    }).state("app.artist-detail", {
      url: "/songwriter/:artistId",
      views: {
        "main-content": {
          templateUrl: "templates/artist-detail.html",
          controller: "ArtistDetailCtrl"
        }
      }
    }).state("app.account", {
      url: "/account",
      views: {
        "main-content": {
          templateUrl: "templates/account.html",
          controller: "AccountCtrl"
        }
      }
    }).state("app.transmit", {
      url: "/transmit",
      views: {
        "main-content": {
          templateUrl: "templates/transmit.html",
          controller: "TransmitCtrl"
        }
      }
    }).state("app.now-playing", {
      url: "/playing",
      views: {
        "main-content": {
          templateUrl: "templates/now-playing.html",
          controller: "PlayerCtrl"
        }
      }
    }).state("app.record", {
      url: "/record",
      views: {
        "main-content": {
          templateUrl: "templates/record.html",
          controller: "RecordCtrl"
        }
      }
    }).state("app.mission", {
      url: "/mission",
      views: {
        "main-content": {
          templateUrl: "templates/mission.html"
        }
      }
    }).state("app.notifications", {
      url: "/notifications",
      views: {
        "main-content": {
          templateUrl: "templates/notifications.html"
        }
      }
    }).state("app.playlists", {
      url: "/playlists",
      views: {
        "main-content": {
          templateUrl: "templates/playlist-index.html",
          controller: "PlaylistIndexCtrl"
        }
      }
    }).state("app.listens", {
      url: "/listens",
      views: {
        "main-content": {
          templateUrl: "templates/listens.html",
          controller: "ListenCtrl"
        }
      }
    }).state("app.playlist-detail", {
      url: "/playlist/:playlistId",
      views: {
        "main-content": {
          templateUrl: "templates/playlist-detail.html",
          controller: "PlaylistDetailCtrl"
        }
      }
    });
    return $urlRouterProvider.otherwise("/songs");
  });

}).call(this);

//# sourceMappingURL=app.js.map
