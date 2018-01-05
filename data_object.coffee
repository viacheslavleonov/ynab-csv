# These are the columns that YNAB expects
ynab_cols = ['Date','Payee','Memo','Amount']

# Uses moment.js to parse and format the date into the correct format
parseDate = (val) -> moment(val).format('YYYY-MM-DD') if val && val.length > 0


# This class does all the heavy lifting.
# It takes the and can format it into csv
class window.DataObject
  constructor: () ->
    @base_json = null

  # Parse base csv file as JSON. This will be easier to work with.
  # It uses http://papaparse.com/ for handling parsing
  parse_csv: (csv) -> @base_json = Papa.parse(csv, {"skipEmptyLines": true, "header": true})
  fields: -> @base_json.meta.fields
  rows: -> @base_json.data


  # This method converts base_json into a json file with YNAB specific fields based on
  #   which fields you choose in the dropdowns in the browser.
  #
  # --- parameters ----
  # limit: expects and integer and limits how many rows get parsed (specifically for preview)
  #     pass in false or null to do all.
  # lookup: hash definition of YNAB column names to selected base column names. Lets us
  #     convert the uploaded CSV file into the columns that YNAB expects.
  converted_json: (limit, lookup) ->
    return nil if @base_json == null
    value = []

    # TODO: You might want to check for errors. Papaparse has an errors field.
    if @base_json.data
      @base_json.data.forEach (row, index) ->
        if !limit || index < limit
          tmp_row = {}
          ynab_cols.forEach (col) ->
            cell = row[lookup[col]]

            # Some YNAB columns need special formatting,
            #   the rest are just returned as they are.
            switch col
              when 'Date' then tmp_row[col] = parseDate(cell)
              when 'Amount'
                tmp_row[col] = accounting.parse(cell)
              else tmp_row[col] = cell

          value.push(tmp_row)
    value

  converted_csv: (limit, lookup) ->
    return nil if @base_json == null
    # Papa.unparse string
    string = ynab_cols.join(',') + "\n"
    @.converted_json(limit, lookup).forEach (row) ->
      row_values = []
      ynab_cols.forEach (col) ->
        row_values.push row[col]
      string += row_values.join(',') + "\n"
    string
