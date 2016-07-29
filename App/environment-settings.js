(function () {
    // Visual Studio Release management will update the base uri to our web api.
    // For local testing, it will revert to the visual studio generated base uri
    var baseUiUrl = "__baseUiUrl__";
    var baseApiUrl = "__baseApiUrl__";


    // If no replacement was done the double underscores will be in still be in the values above.
    // Default to the local debugging urls
    // Testing Comment One two Three
    if (baseApiUrl.substring(0, 6) === "__base") {
        baseUiUrl = 'http://localhost:55582/';
        baseApiUrl = 'https://localhost:44301/';

        window.baseUiUrl = baseUiUrl;
        window.baseApiUrl = baseApiUrl;
    } else {
        window.baseUiUrl = baseUiUrl + "/";
        window.baseApiUrl = baseApiUrl + "/api/";
    }
}());