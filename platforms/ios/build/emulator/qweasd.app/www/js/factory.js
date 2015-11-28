angular.module('app.factory', [])


.factory('Camera', ['$q', function ($q) {

        return {

            getPictureFromGallery: function (options) {
                var q = $q.defer();

                navigator.camera.getPicture(function (result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);

                return q.promise;
            },

            /**
             *
             * @param options
             * @returns {*}
             */
            getPicture: function (options) {
                var q = $q.defer();

                navigator.camera.getPicture(function (result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);

                return q.promise;
            },
            /**
             *
             * @param img_path
             * @returns {*}
             */
            resizeImage: function (img_path) {
                var q = $q.defer();
                window.imageResizer.resizeImage(function (success_resp) {
                    console.log('success, img re-size: ' + JSON.stringify(success_resp));
                    q.resolve(success_resp);
                }, function (fail_resp) {
                    console.log('fail, img re-size: ' + JSON.stringify(fail_resp));
                    q.reject(fail_resp);
                }, img_path, 200, 0, {
                    imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
                    resizeType: ImageResizer.RESIZE_TYPE_MIN_PIXEL,
                    pixelDensity: true,
                    storeImage: false,
                    photoAlbum: false,
                    format: 'jpg'
                });

                return q.promise;
            },

            toBase64Image: function (img_path) {
                var q = $q.defer();
                window.imageResizer.resizeImage(function (success_resp) {
                    console.log('success, img toBase64Image: ' + JSON.stringify(success_resp));
                    q.resolve(success_resp);
                }, function (fail_resp) {
                    console.log('fail, img toBase64Image: ' + JSON.stringify(fail_resp));
                    q.reject(fail_resp);
                }, img_path, 1, 1, {
                    imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
                    resizeType: ImageResizer.RESIZE_TYPE_FACTOR,
                    format: 'jpg'
                });

                return q.promise;
            }
        }
    }]);
