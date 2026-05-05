# SerpentLua Plugin index

- The server for SerpentLua's plugin index. This is a guide for how the API works.

## Terms used
- Session token: Much like RobTop's GJP, but expires every 3 hours. Should reauthenticate each game start.

## GET /api/v1/plugins/fetch
Fetches a plugin's data based on query parameter `id`.

Returns JSON object: (these are pretty self explanatory. Any unclear ones are stated)

- `name`: A string.
- `developer`: A string.
- `id`: A string.
- `version`: A string.
- `serpent_version`: A string. The version of SerpentLua that the plugin targets.
- `script_example`: A string. (this should be a download link to an example script.)
- `description`: A string.
- `download_count`: An integer.
- `status`: A string. Whether the plugin is approved, rejected, or is pending.
- `release_date`: An integer. This is in unix timestamps.
- `last_update_date`: An integer. This is in unix timestamps.
- `download_link`: A string.
- `featured`: A boolean.

Usage: `{url}/api/v1/plugins/fetch?id=six.seven`

Check `Content-Type` prior to using the response returned, if it's not `application/json` it's probably an error.

## GET /api/v1/plugins/fetch/bulk
Fetches multiple plugins.

Has query parameters:

- `sort`: Can only be `most_recent` and `most_downloaded`.
- `featured`: Can only be 1 or 0. Ignored on 0.
- `status`: Can only be `approved`, `pending`, `rejected`.
- `ids`: IDs separated by comma. (Optional)
- `page`: Self explanatory. Returns at most 10 plugins. (Optional)

Note that at least `ids` or `page` must be provided, `?sort=most_recent&featured=0` is not allowed.

## POST /api/v1/plugins/publish
Publishes a plugin to the index. Data is passed in the JSON body.

Must pass Session token as a header `Authorization` to the request. Otherwise the request will be cancelled.

JSON body must have: (These are self explanatory.)

- `name`: A string.
- `developer`: A string.
- `id`: A string.
- `version`: A string.
- `serpent_version`: A string.
- `script_example`: A string. (Optional)
- `description`: A string.
- `download_link`: A string.

Responses:

- 201 Created: Succeeded.
- 403 Forbidden: Means the user is banned, response is the ban reason.
- 400 Bad Request: JSON body is missing keys. Response says what they are.
- 409 Conflict: A plugin already uses this ID.
- 500 Internal Error: Self explanatory.