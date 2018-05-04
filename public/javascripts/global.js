$(document).ready(function() {
  var chatId;
  var amount;

  var handler = StripeCheckout.configure({
    key: 'pk_live_brweKfRgeq7Fe3PH4FScn99S',
    image: 'https://pay.voicybot.com/images/stripe.png',
    locale: 'auto',
    // alipay: true,
    // bitcoin: true,
    closed: function() {
      $("#successLabel").empty();
      $("#errorLabel").empty();
    },
    token: function(token) {
      $("#infoLabel").empty();
      $("#successLabel").empty();
      $("#errorLabel").empty();
      $("#infoLabel").append('Processing payment on Voicy servers...');
      $.ajax({
        type: 'POST',
        url: 'buy',
        data: { 'token': token.id, 'chatId': chatId, 'amount': amount, 'rate': $('input[name=rate]').val() },
        dataType: 'json',
        encode: true
      })
      .done(function(data) {
        if (data['error']) {
          $("#infoLabel").empty();
          $("#successLabel").empty();
          $("#errorLabel").empty();
          $("#errorLabel").append(data['error']);
        } else {
          $("#infoLabel").empty();
          $("#successLabel").empty();
          $("#errorLabel").empty();
          $("#successLabel").append('Thank you for the payment!');
        }
      });
    }
  });

  // Close Checkout on page navigation:
  window.addEventListener('popstate', function() {
    $("#infoLabel").empty();
    $("#successLabel").empty();
    $("#errorLabel").empty();
    handler.close();
  });

  // process the form
  $('form').submit(function(event) {
    var rate = $('input[name=rate]').val();

    event.preventDefault();
    var seconds = $('input[name=numberOfSeconds]').val();
    chatId = $('input[name=chatId]').val();
    var minimalSeconds = 1000;

    if (!seconds || seconds < minimalSeconds) {
      $("#infoLabel").empty();
      $("#successLabel").empty();
      $("#errorLabel").empty();
      $("#errorLabel").append('Please purchase at least ' + minimalSeconds + ' seconds');
    } else {
      var purch = seconds * rate * 100;
      amount = seconds;
      $("#infoLabel").empty();
      $("#successLabel").empty();
      $("#errorLabel").empty();
      $("#infoLabel").append('Please pay at Stripe Checkout');
      handler.open({
        name: 'Voicy Bot',
        description: 'Purchasing ' + seconds + ' seconds',
        currency: 'USD',
        amount: purch,
        // alipay: true,
        // bitcoin: true
      });
    }
  });
});