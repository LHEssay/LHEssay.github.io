calculatePriceAndETA = function () {
    const wordCount = parseInt($("#wordCount").val());
    if (wordCount && wordCount > 0) {
        $("#priceEstimate").text("Estimated price: $" + (wordCount * 0.045).toFixed(2));

        $("#dayEstimate").text("Loading day estimate...");
        const api = 'https://spreadsheets.google.com/feeds/cells/';
        const spreadsheet = "1AZOTC_kl6jCwhPVNpxL3YLMupJAj7-sVDU5WOH17NRY";
        const url = api + spreadsheet + '/default/public/basic/R2C7?alt=json';
        $.getJSON(url).done(function (data) {
            if (data.entry) {
                const baseDays = parseInt(data.entry.content['$t']);
                const additionalDays = Math.round(wordCount / 400 / 4);
                $("#dayEstimate").text("Estimated document return in " + (baseDays + additionalDays) + " days");
            } else {
                $("#dayEstimate").text("Could not load the estimated return date");
            }
        }).fail(function () {
            $("#dayEstimate").text("Could not fetch the estimated return date");
        });
    } else {
        $("#priceEstimate").text("Enter a word count to get a price and return date estimate");
        $("#dayEstimate").text("");
    }
};

submitRequest = function () {
    const clientName = $("#clientName").val();
    const clientEmail = $("#clientEmail").val();
    const documentLink = $("#documentLink").val();
    const submissionComments = $("#submissionComments").val();
    const selfReportedWordCount = $("#wordCount").val();

    if (!(clientName && clientEmail && documentLink && selfReportedWordCount && submissionComments &&
        clientName.length > 0 && clientEmail.length > 0 && documentLink.length > 0 &&
        selfReportedWordCount.length > 0 && submissionComments.length > 0)) {
        $(`<div class="alert alert-warning alert-dismissible submit-error-alert" role="alert">
            Please fill out all of the fields before submitting your request.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`).hide().appendTo("#top").fadeIn(500);
        return;
    }

    const messageHTML = `
    Email: ${clientEmail}<br>
    Link to Document: ${documentLink}<br>
    Self Reported Word Count: ${selfReportedWordCount}<br>
    Submission Comments:<br>${submissionComments}`;
    const template_params = {"from_name": clientName, "message_html": messageHTML};

    const submitButton = $("#submitRequest");
    submitButton.text("Submitting Request...");
    submitButton.prop("disabled", true);

    emailjs.send("default_service", "new_request", template_params).then(function () {
        submitButton.text("Request Sent");
    }, function (err) {
        console.log(JSON.stringify(err));
        $(`<div class="alert alert-danger alert-dismissible submit-error-alert" role="alert">
            Failed to submit your edit request. Please check your internet connection and try again.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`).hide().appendTo("#top").fadeIn(500);
        submitButton.prop("disabled", false);
        submitButton.text("Submit Request");
    });
};

