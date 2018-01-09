// see http://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
// see http://stackoverflow.com/questions/18662404/download-lengthy-data-as-a-csv-file
angular.element(document).ready(function() {
  angular.module("app", []);
  angular.module("app").directive("fileread", [
    function() {
      return {
        scope: {
          fileread: "="
        },
        link: function(scope, element, attributes) {
          return element.bind("change", function(changeEvent) {
            var reader;
            reader = new FileReader();
            reader.onload = function(loadEvent) {
              return scope.$apply(function() {
                scope.fileread = loadEvent.target.result;
              });
            };
            reader.readAsText(changeEvent.target.files[0], attributes.encoding);
          });
        }
      };
    }
  ]);
  angular.module("app").directive("dropzone", [
    function() {
      return {
        transclude: true,
        replace: true,
        template: '<div class="dropzone"><div ng-transclude></div></div>',
        scope: {
          dropzone: "="
        },
        link: function(scope, element, attributes) {
          element.bind("dragenter", function(event) {
            element.addClass("dragging");
            event.preventDefault();
          });
          element.bind("dragover", function(event) {
            var efct;
            element.addClass("dragging");
            event.preventDefault();
            efct = event.dataTransfer.effectAllowed;
            event.dataTransfer.dropEffect =
              "move" === efct || "linkMove" === efct ? "move" : "copy";
          });
          element.bind("dragleave", function(event) {
            element.removeClass("dragging");
            event.preventDefault();
          });
          element.bind("drop", function(event) {
            var reader;
            element.removeClass("dragging");
            event.preventDefault();
            event.stopPropagation();
            reader = new FileReader();
            reader.onload = function(loadEvent) {
              scope.$apply(function() {
                scope.dropzone = loadEvent.target.result;
              });
            };
            reader.readAsText(event.dataTransfer.files[0], attributes.encoding);
          });
        }
      };
    }
  ]);
  // Application code
  angular.module("app").controller("ParseController", function($scope) {
    $scope.angular_loaded = true;
    $scope.ynab_cols = ["Date", "Payee", "Memo", "Amount"];
    $scope.data = {};
    $scope.ynab_map = {
      Date: "Date",
      Payee: "Payee",
      Memo: "Memo",
      Outflow: "Amount"
    };
    $scope.file = {
      encodings: ["UTF-8", "ISO-8859-1", "windows-1250"],
      chosenEncoding: "UTF-8"
    };
    $scope.data_object = new DataObject();
    $scope.$watch("data.source", function(newValue, oldValue) {
      if (newValue && newValue.length > 0) {
        $scope.data_object.parse_csv(newValue, $scope.file.chosenEncoding);
        $scope.preview = $scope.data_object.converted_json(10, $scope.ynab_map);
      }
    });
    $scope.$watch(
      "ynab_map",
      function(newValue, oldValue) {
        $scope.preview = $scope.data_object.converted_json(10, newValue);
      },
      true
    );
    $scope.csvString = function() {
      return $scope.data_object.converted_csv(null, $scope.ynab_map);
    };
    $scope.downloadFile = function() {
      var a;
      a = document.createElement("a");
      a.href =
        "data:attachment/csv;base64," +
        btoa(unescape(encodeURIComponent($scope.csvString())));
      a.target = "_blank";
      a.download = `ynab_data_${moment().format("YYYYMMDD")}.csv`;
      document.body.appendChild(a);
      a.click();
    };
  });
  angular.bootstrap(document, ["app"]);
});
