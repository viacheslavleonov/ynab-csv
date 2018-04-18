// These are the columns that YNAB expects
var ynab_cols;

ynab_cols = ["Date", "Payee", "Memo", "Amount"];

// This class does all the heavy lifting.
// It takes the and can format it into csv
window.DataObject = class DataObject {
  constructor() {
    this.base_json = null;
  }

  // Parse base csv file as JSON. This will be easier to work with.
  // It uses http://papaparse.com/ for handling parsing
  parse_csv(csv, encoding) {
    return (this.base_json = Papa.parse(csv, {
      skipEmptyLines: true,
      header: true
    }));
  }

  fields() {
    return this.base_json.meta.fields;
  }

  rows() {
    return this.base_json.data;
  }

  // This method converts base_json into a json file with YNAB specific fields based on
  //   which fields you choose in the dropdowns in the browser.

  // --- parameters ----
  // limit: expects and integer and limits how many rows get parsed (specifically for preview)
  //     pass in false or null to do all.
  // lookup: hash definition of YNAB column names to selected base column names. Lets us
  //     convert the uploaded CSV file into the columns that YNAB expects.
  converted_json(limit, lookup) {
    var value;
    if (this.base_json === null) {
      return null;
    }
    value = [];
    // TODO: You might want to check for errors. Papaparse has an errors field.
    if (this.base_json.data) {
      this.base_json.data.forEach(function(row, index) {
        var tmp_row;
        if (!limit || index < limit) {
          tmp_row = {};
          ynab_cols.forEach(function(col) {
            var cell;
            cell = row[lookup[col]];
            tmp_row[col] = cell;
          });
          value.push(tmp_row);
        }
      });
    }
    return value;
  }

  converted_csv(limit, lookup) {
    var string;
    if (this.base_json === null) {
      return nil;
    }
    // Papa.unparse string
    string = '"' + ynab_cols.join('","') + '"\n';
    this.converted_json(limit, lookup).forEach(function(row) {
      var row_values;
      row_values = [];
      ynab_cols.forEach(function(col) {
        return row_values.push(row[col]);
      });
      return (string += '"' + row_values.join('","') + '"\n');
    });
    return string;
  }
};
