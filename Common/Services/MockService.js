(function (module) {
    "use strict";

    module.run(function ($httpBackend, filterFilter, Mlb) {
        var titleAndDate = {
            Title: '',
            ContactPerson: '',
            MatterNumber: '',
            Date: null,
            Time: null,
            Duration: null,
            TimeZone: ''
        };
        var mlLocations = [];
        var additionalInfo = {
            AudioFlag: false,
            AudioDomesticLinesNo: null,
            AudioInternationalLinesNo: null,
            AudioPin: null,
            VideoPin: null,
            OnlineMeetingFlag: false,
            LCDRequiredFlag: false,
            LaptopRequiredFlag: false,
            ScreenRequiredFlag: false,
            Info: ""
        };

        var clientLocations = [];
        var conference = {
            ID: '123',
            Title: titleAndDate.Title,
            ContactPerson: titleAndDate.ContactPerson,
            MatterNumber: titleAndDate.MatterNumber,
            Date: titleAndDate.Date,
            Time: titleAndDate.Time,
            Duration: titleAndDate.Duration,
            TimeZone: titleAndDate.TimeZone,
            MLLocatons: mlLocations,
            ClientLocations: clientLocations,
            Info: additionalInfo.Info,
            AudioFlag: additionalInfo.AudioFlag,
            OnlineMeetingFlag: additionalInfo.OnlineMeetingFlag
        };
        //{"Conference":{
        //  "ID":"123",
        //  "Title":"myTitle",
        //  "ContactPerson":"Jose Rivas",
        //  "MatterNumber":"12361-13",
        //  "Date":"05/13/2015",
        //  "Time":"07:06",
        //  "Duration":"1",
        //  "TimeZone":"GMT-0400 (Eastern Daylight Time)",
        //  "MlLocatons":[{
        //     "LocalContact":"Jose Rivas",
        //     "Office":"1801 Market",
        //     "Attendees":"5",
        //     "Guests":[{"GuestName":"James Dimon","Office":"JP Morgan Chase"}]
        //  }],
        //  "ClientLocations":[],
        //  "Info":"we will be in room 20-B",
        //  "OnlineMeetingFlag":false,
        //  "AudioFlag":false
        //}}


        var people = [{ person: "Jose Rivas", office: "Philadelphia" }, { person: "Jon Doe", office: "Philadelphia" }, { person: "Jane Lewis", office: "California" }];

        //TITLE AND DATE
        var titleAndDateUrl = new RegExp(window.baseUiUrl + "/api/Conference/\\w*/TitleAndDate", "i");
        $httpBackend.whenGET(titleAndDateUrl).respond(function () {
            return [200, titleAndDate, {}];
        });
        $httpBackend.whenPUT(titleAndDateUrl).respond(function (method, url, data) {
            var parsedData = JSON.parse(data);

            titleAndDate.Title = parsedData.Title;
            titleAndDate.ContactPerson = parsedData.ContactPerson;
            titleAndDate.MatterNumber = parsedData.MatterNumber;
            titleAndDate.Date = parsedData.Date;
            titleAndDate.Time = parsedData.Time;
            titleAndDate.Duration = parsedData.Duration;
            titleAndDate.TimeZone = parsedData.TimeZone;

            return [200, titleAndDate, {}];
        });

        //ML LOCATIONS
        var locationUrl = new RegExp(window.baseUiUrl + "/api/Conference/\\w*/MLLocations", "i");
        $httpBackend.whenGET(locationUrl).respond(function () {
            return [200, mlLocations, {}];
        });
        $httpBackend.whenPUT(locationUrl).respond(function (method, url, data) {
            var parsedData = JSON.parse(data);
            mlLocations = parsedData;

            return [200, mlLocations, {}];
        });

        //Client LOCATIONS
        var clientLocationUrl = new RegExp(window.baseUiUrl + "/api/Conference/\\w*/ClientLocations", "i");
        $httpBackend.whenGET(clientLocationUrl).respond(function () {
            return [200, clientLocations, {}];
        });
        $httpBackend.whenPUT(clientLocationUrl).respond(function (method, url, data) {
            var parsedData = JSON.parse(data);
            clientLocations = parsedData;

            return [200, clientLocations, {}];
        });

        //ADDITIONAL INFO
        var infoUrl = new RegExp(window.baseUiUrl + "/api/Conference/\\w*/AdditionalInfo", "i");
        $httpBackend.whenGET(infoUrl).respond(additionalInfo);
        $httpBackend.whenPUT(infoUrl).respond(function (method, url, data) {
            var parsedData = JSON.parse(data);
            additionalInfo.AudioFlag = parsedData.AudioFlag;
            if (parsedData.AudioFlag) {
                additionalInfo.AudioDomesticLinesNo = parsedData.AudioDomesticLinesNo;
                additionalInfo.AudioInternationalLinesNo = parsedData.AudioInternationalLinesNo;
                additionalInfo.AudioPin = parsedData.AudioPin;
                additionalInfo.VideoPin = parsedData.VideoPin;
            }
            additionalInfo.OnlineMeetingFlag = parsedData.OnlineMeetingFlag;
            if (parsedData.OnlineMeetingFlag) {
                additionalInfo.LCDRequiredFlag = parsedData.LCDRequiredFlag;
                additionalInfo.LaptopRequiredFlag = parsedData.LaptopRequiredFlag;
                additionalInfo.ScreenRequiredFlag = parsedData.ScreenRequiredFlag;
            }
            additionalInfo.Info = parsedData.Info;

            return [200, additionalInfo, {}];
        });

        //FILTER PEOPLE
        var peopleUrl = new RegExp(window.baseUiUrl + "/api/getPeople\\?person=\\w*", "i");
        $httpBackend.whenGET(peopleUrl).respond(function (method, url) {
            var person = Mlb.getParameterByName(url, "person");
            var filteredPeople = filterFilter(people, person);

            return [200, filteredPeople, {}];
        });

        //CONFERENCE
        var conferenceUrl = window.baseUiUrl + "/api/Conference";
        $httpBackend.whenGET(conferenceUrl).respond(function () {
            conference = {
                ID: '123',
                Title: titleAndDate.Title,
                ContactPerson: titleAndDate.ContactPerson,
                MatterNumber: titleAndDate.MatterNumber,
                Date: titleAndDate.Date,
                Time: titleAndDate.Time,
                Duration: titleAndDate.Duration,
                TimeZone: titleAndDate.TimeZone,
                MLLocatons: mlLocations,
                ClientLocations: clientLocations,
                Info: additionalInfo.Info,
                AudioFlag: additionalInfo.AudioFlag,
                AudioDomesticLinesNo: additionalInfo.AudioDomesticLinesNo,
                AudioInternationalLinesNo: additionalInfo.AudioInternationalLinesNo,
                AudioPin: additionalInfo.AudioPin,
                VideoPin: additionalInfo.VideoPin,
                OnlineMeetingFlag: additionalInfo.OnlineMeetingFlag,
                LCDRequiredFlag: additionalInfo.LCDRequiredFlag,
                LaptopRequiredFlag: additionalInfo.LaptopRequiredFlag,
                ScreenRequiredFlag: additionalInfo.ScreenRequiredFlag
            };
            return [200, conference, {}];
        });
        $httpBackend.whenPOST(conferenceUrl).respond(function (method, url, data) {
            var parsedData = JSON.parse(data);
            titleAndDate.Title = parsedData.Title;
            titleAndDate.ContactPerson = parsedData.ContactPerson;
            titleAndDate.MatterNumber = parsedData.MatterNumber;
            titleAndDate.Date = parsedData.Date;
            titleAndDate.Time = parsedData.Time;
            titleAndDate.Duration = parsedData.Duration;
            titleAndDate.TimeZone = parsedData.TimeZone;
            if (parsedData.MLLocatons) {
                mlLocations = parsedData.MLLocatons;
            }
            if (parsedData.ClientLocatons) {
                clientLocations = parsedData.ClientLocatons;
            }
            additionalInfo.Info = parsedData.Info;
            additionalInfo.AudioFlag = parsedData.AudioFlag;
            additionalInfo.OnlineMeetingFlag = parsedData.OnlineMeetingFlag;
            return [200, conference, {}];
        });


        $httpBackend.whenGET(/App\//).passThrough();
        $httpBackend.whenGET(/Common\//).passThrough();
        $httpBackend.whenGET(/locale\//).passThrough();

    });

}(angular.module("infoServiceMock", ["ngMockE2E"])));