/* =========================================
   GOOGLE APPS SCRIPT URL
========================================= */

const SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzWet9ZV7nCGUq8_Y4AMakd-rQx5leV5PVIT54s7QuOd0nDMcgCZp3zezEwmRloLxF9/exec';


/* =========================================
   SERVICE LAYER
   Handles communication with Google Script
========================================= */

class RsvpService {

  constructor(scriptUrl) {

    this.scriptUrl = scriptUrl;

  }


  sendResponse(data) {

    const formData =
      new URLSearchParams();


    formData.append(
      'name',
      data.name
    );


    formData.append(
      'attendance',
      data.attendance
    );


    return fetch(
      this.scriptUrl,
      {

        method: 'POST',

        mode: 'no-cors',

        headers: {

          'Content-Type':
            'application/x-www-form-urlencoded'

        },

        body:
          formData.toString()

      }
    );

  }

}


/* =========================================
   UI LAYER
   Handles the visual interface
========================================= */

class RsvpFormUI {

  constructor() {

    this.formElement =
      document.getElementById(
        'rsvpForm'
      );


    this.nameInput =
      document.getElementById(
        'name'
      );


    this.attendanceSelect =
      document.getElementById(
        'attendance'
      );


    this.confirmationMessage =
      document.getElementById(
        'confirmation'
      );

  }


  getFormData() {

    return {

      name:
        this.nameInput.value.trim(),

      attendance:
        this.attendanceSelect.value

    };

  }


  showSuccessState(
    attendanceValue
  ) {

    /*
      Hide RSVP form immediately
    */

    this.formElement.style.display =
      'none';


    /*
      Determine confirmation message
    */

    if (
      attendanceValue.includes(
        "Yes"
      )
    ) {

      this.confirmationMessage.className =
        'attending-msg';


      /*
        Surprise icon: a random one pops up
        together with the confirmation.
      */

      const surprises =
        ['🏆', '🎁', '👑', '🏎️', '🥇', '🎈', '🍼'];

      const surprise =
        surprises[
          Math.floor(
            Math.random() * surprises.length
          )
        ];


      this.confirmationMessage.innerHTML =
        '<span class="surprise-icon" aria-hidden="true">' +
        surprise +
        '</span>' +
        '<span class="confirm-text">' +
        '🏁 VIP CHAMPION PASS CONFIRMED! SEE YOU THERE!' +
        '</span>';

    }

    else {

      this.confirmationMessage.className =
        'declined-msg';


      this.confirmationMessage.innerHTML =
        '🏁 WE\'LL MISS YOU AT THE RACE! THANK YOU FOR LETTING US KNOW! 🙏';

    }


    /*
      Show confirmation
    */

    this.confirmationMessage.style.display =
      'block';

  }

}


/* =========================================
   CONTROLLER LAYER
   Handles application events
========================================= */

class RsvpApp {

  constructor(
    service,
    ui
  ) {

    this.service =
      service;

    this.ui =
      ui;

  }


  init() {

    this.ui.formElement.addEventListener(
      'submit',
      (event) =>
        this.handleSubmit(event)
    );

  }


  handleSubmit(event) {

    event.preventDefault();


    /*
      Get guest information
    */

    const formData =
      this.ui.getFormData();


    /*
      The message only appears once the form is
      really filled out (a name made of spaces
      does not count).
    */

    if (
      !formData.name ||
      !formData.attendance
    ) {

      this.ui.nameInput.value =
        formData.name;

      (
        !formData.name
          ? this.ui.nameInput
          : this.ui.attendanceSelect
      ).reportValidity();

      return;

    }


    /*
      INSTANT UX

      Show confirmation immediately
      without waiting for Google Sheets.
    */

    this.ui.showSuccessState(
      formData.attendance
    );


    /*
      BACKGROUND DISPATCH

      Send RSVP to Google Sheets.
    */

    this.service
      .sendResponse(
        formData
      )

      .catch(
        (error) => {

          console.error(
            'Background dispatch error:',
            error
          );

        }
      );

  }

}


/* =========================================
   APPLICATION INITIALIZATION
========================================= */

const rsvpService =
  new RsvpService(
    SCRIPT_URL
  );


const rsvpUI =
  new RsvpFormUI();


const app =
  new RsvpApp(
    rsvpService,
    rsvpUI
  );


app.init();