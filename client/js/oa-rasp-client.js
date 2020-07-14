/** ===================================================================
 * OAuthentic Physical Access Controller on Raspberry - Javascript Client
 * --------------------------------------------------------------------
 *  oa: global OAuthentic utility functions
 *  rom: constants
 *  ram: variables
 *  screen: Screen instances (defined in file below)
 *  local: localized text (defined in local.js
 */
let oa = {};
let rom = {
    version: "0.5.0",
    // To enable console
    debug: true,
    // To enable remote server instead of localhost
    remote: false,
    // Local HTTP server parameters. To customize depending on development environment‡
    http: {
        url: "http://localhost:8080",
        remote: "http://192.168.1.103:8080",
        mode: 'cors',
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Access-Control-Origin": "*"
        },
        api: "https://api.oauthentic.com"
    },
    // Supported languages
    languages: ["en", "fr"],
    // Local storage prefix
    prefix: "rasp",
    logoHD: "01/img/oauthentic-hd.png"
};
let ram = {
    // Current language in {"en", "fr"} set by user and stored locally
    lang: "",
    // Controller data from /hardware/read
    controller: {},
    // OAuthentic control instance
    qr: {},
    // Screen size and related UI resources
    screen: {
        width: 0,
        height: 0,
        qr: 0,
        logo: 0,
        title: 0,
        text: 0
    }
};

// -------------------------------------------------------------------
// GLOBAL UTILITIES
// -------------------------------------------------------------------
oa = {
    /** --------------------------------------------------------------------
     * @function oa.qs
     * @description Shortcut for querySelector
     * @param {string} s
     * @return {object}
     */
    qs: function (s) {
        return document.querySelector(s);
    },
    /** --------------------------------------------------------------------
     * @function oa.qsa
     * @description Shortcut for querySelectorAll
     * @param {string} s
     * @return {array}
     */
    qsa: function (s) {
        return document.querySelectorAll(s);
    },
    /** --------------------------------------------------------------------
     * @function oa.log
     * @description Customized console.log enabled by rom.debug
     */
    log: function () {
        if (rom.debug) {
            let args = Array.prototype.concat.apply(["🛡"], arguments);
            console.log.apply(console, args);
        }
    },
    /** --------------------------------------------------------------------
     * @function oa.extend
     * @description Similar to jQuery extend.
     * @param {object} a - default property list
     * @param {object} b - specific property list
     * @return {object} a updated with b.
     */
    extend: function (a, b) {
        for (let key in b)
            if (b.hasOwnProperty(key))
                a[key] = b[key];
        return a;
    },

    /** --------------------------------------------------------------------
     * @function oa.post
     * @description Promise POST request with headers defined in rom
     * @param {string} url
     * @param {object} params
     * @return {promise}
     */
    post: function (url, params) {

        return new Promise(function (success, failure) {


            fetch(url, {
                method: "POST",
                headers: rom.http.headers,
                mode: rom.mode,
                body: JSON.stringify(params)
            }).then(function (response) {
                return response.json();
            }).then(success).catch(failure);
        });
    },


    /** --------------------------------------------------------------------
     * @function oa.localize
     * @description Apply language based messages to DOM elements
     *              Require the following global variables
     *                  - local: Localized message definition
     *                  - ram.lang: Current langage
     */
    localize: function () {

        for (let id in local) {
            if (local.hasOwnProperty(id)) {

                // Selectors
                let selectId = document.getElementById(id),
                    selectClass = document.getElementsByClassName(id),
                    selectHead = document.getElementById("head"),
                    i = 0;

                switch (local[id].prop) {
                    // Id: HTML content
                    case "html":
                        selectId.innerHTML = local[id][ram.lang];
                        break;
                    // Id: Title
                    case "title":
                        selectId.setAttribute("title", local[id][ram.lang]);
                        break;
                    // Id: Href
                    case "href":
                        selectId.href(local[id][ram.lang]);
                        break;
                    // Id: Input value
                    case "value":
                        selectId.value(local[id][ram.lang]);
                        break;
                    // Id: Input placeholder
                    case "placeholder":
                        selectId.placeholder = local[id][ram.lang];
                        break;
                    // Id: Image source
                    case "src":
                        selectId.src = local[id][ram.lang];
                        break;
                    // Class: HTML content
                    case "class-html":
                        for (i = 0; i < selectClass.length; i++) {
                            selectClass[i].innerHTML = local[id][ram.lang];
                        }
                        break;
                    // Class: Title
                    case "class-title":
                        for (i = 0; i < selectClass.length; i++) {
                            selectClass[i].setAttribute("title", local[id][ram.lang]);
                        }
                        break;
                    // Class: INPUT placeholder
                    case "class-placeholder":
                        for (i = 0; i < selectClass.length; i++) {
                            selectClass[i].placeholder = local[id][ram.lang];
                        }
                        break;
                    // Class: IMG src
                    case "class-src":
                        for (i = 0; i < selectClass.length; i++) {
                            selectClass[i].src = local[id][ram.lang];
                        }
                        break;
                    // Class: A href
                    case "class-href":
                        for (i = 0; i < selectClass.length; i++) {
                            selectClass[i].href = local[id][ram.lang];
                        }
                        break;
                    // Head: Title
                    case "metaTitle":
                        document.title = local["metaTitle"][ram.lang];
                        break;
                    // Head: Description
                    case "metaDescription":
                        document.getElementsByTagName('meta')["description"].content = local["metaDescription"][ram.lang];
                        break;
                }
            }
        }

        // Localize date
        oa.qsa(".local-date").forEach(function (ld) {
            ld.innerHTML = new Date(ld.getAttribute("data-date")).toLocaleDateString(ram.lang);
        })

        // Localize badge img
        oa.qs("#btn-apple").classList.add(ram.lang);
        oa.qs("#btn-google").classList.add(ram.lang);

        // Save lang in storage
        localStorage[rom.prefix + "Lang"] = ram.lang;
        oa.log("lang:", ram.lang);
    }
};

// -------------------------------------------------------------------
// SCREEN CLASS
// -------------------------------------------------------------------
class Screen {

    // Create instance
    constructor(name, options) {

        // Init name
        this.name = name;

        // Init UI with option and default screen name
        this.ui = (options.ui ? options.ui : {});
        this.ui.name = oa.qs("#" + name);

        // Exec once functions
        if (typeof options.once === "function") {
            options.once();
        }
    }

    // Show instance
    show() {

        // Hide all screens
        document.querySelectorAll(".screen").forEach(function (s) {
            s.style.display = "none";
        });

        // Show the current one
        this.ui.name.style.display = "block";
    }
}
let screen = {};
// -------------------------------------------------------------------
// SCREEN DEFINITION
// -------------------------------------------------------------------

screen.start = new Screen("start", {

    ui: {
        lang: oa.qsa(".lang")
    },

    once: function () {

        // Language selection buttons
        this.ui.lang.forEach(function (btn) {
            btn.onclick = function () {
                ram.lang = btn.getAttribute("id").substr(4);
                oa.localize();
                checkNetwork();
            };
        });
    }
});
screen.network = new Screen("network", {

    ui: {
        close: oa.qs("#btn-close"),
    },

    once: function () {

        // Click to close
        this.ui.close.onclick = function () {

            oa.post((rom.remote ? rom.http.remote : rom.http.url), {
                rsc: "shell",
                cmd: "pkill -f chromium"
            }).then(function (res) {
                if (res.code !== "200") {
                    oa.log("pkill command error:", res.code, res.data.ok);
                } else {
                    oa.log("pkill command success:");
                }
            }).catch(function (err) {
                oa.log("pkill command failure:", err);
            })
        };
    }
});
screen.install = new Screen("install", {

    ui: {
        btns: oa.qsa("#install .button"),
        qr: oa.qs("#install-qr")
    },

    once: function () {

        // Press store button
        this.ui.btns.forEach(function (btn) {
            btn.onclick = function () {
                let store = btn.getAttribute("id").substr(4);
                oa.log("Store:", store);
                screen[store].show();
            };
        });

        // Button is enabled only when required
        this.ui.qr.onclick = function () {

            // Remove all class from QR and restart device check
            if (screen.install.ui.qr.classList.contains("reload-en") || screen.install.ui.qr.classList.contains("reload-fr")) {
                screen.install.ui.qr.className = "";
                checkHardware();
            }
        }
    }
});
screen.apple = new Screen("apple", {

    ui: {
        back: oa.qs("#apple-back")
    },

    once: function () {

        // Back to install screen
        this.ui.back.onclick = function () {
            screen.install.show()
        }
    }
});
screen.google = new Screen("google", {

    ui: {
        back: oa.qs("#google-back")
    },

    once: function () {

        // Back to install screen
        this.ui.back.onclick = function () {
            screen.install.show()
        }
    }
});
screen.confirm = new Screen("confirm", {

    ui: {
        hname: oa.qs("#confirm-name"),
        huid: oa.qs("#confirm-huid"),
        ok: oa.qs("#confirm-ok")
    },

    once: function () {
        this.ui.ok.onclick = function () {
            readHardware();
        }
    }
});
screen.home = new Screen("home", {

    ui: {
        main: oa.qs("#home"),
        title: oa.qs("#home-title"),
        text: oa.qs("#home-text"),
        logo: oa.qs("#home-logo"),
    },

    once: function () {
    }
});
screen.result = new Screen("result", {

    ui: {
        main: oa.qs("#result"),
        title: oa.qs("#result-title"),
        text: oa.qs("#result-text"),
        logo: oa.qs("#result-logo"),
        progress: oa.qs("#result-progress")
    },

    once: function () {
    }
});
/** -------------------------------------------------------
 * @function screen.result.display
 * @description Display temporary result screen with various optional parameters
 * @param {object} options
 */
screen.result.display = function (options) {


    let opt = {
        success: true,
        time: 5,
        title: "Welcome",
        text: "Please enter.",
        callback: function () {
            oa.log("Result screen callback");
        }
    }
    oa.extend(opt, options);

    // Customize content
    screen.result.ui.title.innerHTML = opt.title;
    screen.result.ui.text.innerHTML = opt.text;

    // Progress color on success
    screen.result.ui.progress.className = "";
    if (!opt.success) {
        screen.result.ui.progress.classList.add("error");
    }

    // Set the transition duration and show screen
    screen.result.ui.progress.style.transitionDuration = opt.time + "s";
    screen.result.ui.name.style.display = "block";

    // Start progress transition after a short time
    let timerStart = setTimeout(function () {
        screen.result.ui.progress.style.width = 0;

        // On progress end, reset width and duration
        let timerStop = setTimeout(function () {
            screen.result.ui.progress.style.transitionDuration = 0;
            screen.result.ui.progress.style.width = "100%";
            screen.result.ui.name.style.display = "none";
            if (typeof opt.callback === "function") {
                opt.callback()
            }
        }, opt.time * 1000);
    }, 10);
};

/** -------------------------------------------------------
 * @function screen.customize
 * @description Customize screen with UI definition
 * @param {object} ui
 */
screen.customize = function(ui) {

    screen.home.ui.main.className = "screen";
    screen.result.ui.main.className = "screen";
    if (ui.screen.background) {
        screen.home.ui.main.classList.add(ui.screen.background);
        screen.result.ui.main.classList.add(ui.screen.background);
    }
    if (ui.screen.color) {
        screen.home.ui.main.style.color = ui.screen.color;
        screen.result.ui.main.style.color = ui.screen.color;
    }

    let logoURL = (ui.screen.logo === "default" || ui.screen.logo === "" ? rom.logoHD : ui.screen.logo);
    screen.home.ui.logo.src = logoURL;
    screen.result.ui.logo.src = logoURL;

    // Customize access control screen
    screen.home.ui.title.innerHTML = ui.control.title;
    screen.home.ui.text.innerHTML = ui.control.text.replace("OAuthentic", "<i class='orange'>O</i>Authentic");
}
// -------------------------------------------------------------------
// ACCESS CONTROL PROCESS: INSTALLATION AND OPERATION
// -------------------------------------------------------------------

// Check network when localization is OK
checkNetwork = function () {

    oa.log("Starting network check");
    oa.post((rom.remote ? rom.http.remote : rom.http.url), {
        "rsc": "network"
    }).then(function (res) {

        // Request error or no network
        if (res.code !== "200" || !res.data.network.ok) {
            oa.log("Network request error:", res.code, res.data.network.ok);
            screen.network.show();
            return;
        }

        // Store hardware serial number in an OAuthentic device ID compilant format
        // BE CAREFUL TO KEEP THE FOLLOWING PREFIX TO BE ACCEPTED BY API ENDPOINT
        localStorage[rom.prefix + "Serial"] = "1234567890123456" + res.data.system.serial;
        oa.log("Network OK ==> Serial stored");
        checkHardware();

    }).catch(function (err) {
        oa.log("Network request failure:", err);
        screen.network.show();
    })
}

// Check hardware when network is OK
checkHardware = function () {

    oa.log("Starting hardware installation check");

    // No valid local storage ==> Need to authenticate to install hardware
    if (!localStorage[rom.prefix + "Huid"] || localStorage[rom.prefix + "Huid"].length !== 32 || localStorage[rom.prefix + "Serial"].length !== 32) {

        // Get an installation token
        oa.post(rom.http.api + "/hardware/token", {}).then(function (r) {

            oa.log("Hardware token success:", r.data.key, r.data.token, r.data.expire);

            new OAuthentic().authent("install-qr", {
                key: r.data.key,
                token: r.data.token,
                expire: new Date(r.data.expire),
                side: 200,
                expired: function () {
                    oa.log("Installation authentication expired");
                    screen.install.ui.qr.classList.add("reload-" + ram.lang);
                },
                completed: function (result) {

                    oa.log("Installation authentication success")

                    // Install new hardware with installation data
                    oa.post(rom.http.api + "/hardware/install", {
                        email: result.data.user.email,
                        serial: localStorage[rom.prefix + "Serial"],
                        session: result.data.session
                    }).then(function (r) {

                        // Installation error
                        if (r.code !== "200") {
                            oa.log("Installation error. Retry");
                            screen.install.ui.qr.classList.add("reload-" + ram.lang);
                            return;
                        }

                        // Save locally new HUID
                        localStorage[rom.prefix + "Huid"] = r.data.huid;

                        // Install success => Store OAuthentic Hardware ID (huid)
                        screen.confirm.show();
                        screen.confirm.ui.hname.innerHTML = r.data.name;
                        screen.confirm.ui.huid.innerHTML = r.data.huid;
                        oa.log("Hardware install :", r);
                    });
                }
            });
        }).catch(function (err) {
            oa.log("Hardware token failure:", err);
        });

        screen.install.show();
    }
    // Hardware already installed ==> Proceed to /hardware/read and welcome screen
    else {
        readHardware();
    }
}

// Read installed hardware
readHardware = function () {


    /** -------------------------------------------------------
     * @function initQR
     * @description Init OAuthentic QR display for access control
     * @param {object} hw - hardware data
     */
    let initQR = function (hw) {

        // Get a control token
        oa.post(rom.http.api + "/hardware/token", {
            huid: localStorage[rom.prefix + "Huid"]
        }).then(function (r) {

            oa.log("Hardware token success:", r.data.key, r.data.token, r.data.expire);

            ram.qr = new OAuthentic();
            ram.qr.authent("qr-control", {
                key: r.data.key,
                token: r.data.token,
                expire: new Date(r.data.expire),
                side: ram.screen.qr,
                expired: function () {

                    // Kill current instance and restart function
                    oa.log("Access control expired")
                    delete ram.qr;
                    initQR(hw);
                },
                completed: function (result) {

                    // Kill current instance
                    delete ram.qr;

                    if (!result.data.success) {
                        oa.log("Authentication completed: Error");
                        screen.result.display({
                            success: false,
                            title: hw.ui.error.title,
                            text: hw.ui.error.text.replace("OAuthentic"),
                            logo: hw.ui.error.logo,
                            callback: function () {
                                delete ram.qr;
                                initQR(hw)
                            }
                        });
                    } else {
                        oa.log("Authentication completed: Success ==> Checking ACL");

                        // Check user access right for this hardware
                        oa.post(rom.http.api + "/hardware/control", {
                            serial: localStorage[rom.prefix + "Serial"],
                            huid: localStorage[rom.prefix + "Huid"],
                            email: result.data.user.email
                        }).then(function (r) {
                            // ACL error
                            if (r.code !== "200") {
                                oa.log("ACL check error", r);
                                screen.result.display({
                                    success: false,
                                    title: hw.ui.error.title,
                                    text: hw.ui.error.text.replace("OAuthentic"),
                                    logo: hw.ui.error.logo,
                                    callback: function () {
                                        initQR(hw)
                                    }
                                });
                            } else {
                                oa.log("ACL check completed", r);

                                if (r.data.user !== result.data.user.email) {
                                    oa.log("Access rejected");
                                    screen.result.display({
                                        success: false,
                                        title: hw.ui.error.title,
                                        text: hw.ui.error.text.replace("OAuthentic"),
                                        logo: hw.ui.error.logo,
                                        callback: function () {
                                            initQR(hw)
                                        }
                                    });
                                } else {
                                    oa.log("Access accepted");
                                    oa.post((rom.remote ? rom.http.remote : rom.http.url), {
                                        rsc: "success",
                                        time: hw.actuator.time
                                    }).then(function (res) {
                                        if (res.code === "200") {
                                            oa.log("Action success:", hw.actuator.time);
                                        } else {
                                            oa.log("Action Error:", res.code);
                                        }
                                    }).catch(function (err) {
                                        oa.log("Action failure:", err);
                                    })
                                    screen.result.display({
                                        title: hw.ui.success.title,
                                        text: hw.ui.success.text.replace("OAuthentic"),
                                        logo: hw.ui.success.logo,
                                        time: hw.actuator.time,
                                        callback: function () {
                                            initQR(hw)
                                        }
                                    });
                                }
                                // Update UI customization with latest value
                                screen.customize(r.data.hardware.ui);
                            }
                        });
                    }
                }
            });
        }).catch(function (err) {
            oa.log("Hardware token failure:", err);
        });
    };

    oa.post(rom.http.api + "/hardware/read", {
        serial: localStorage[rom.prefix + "Serial"],
        huid: localStorage[rom.prefix + "Huid"]
    }).then(function (r) {

        // Hardware error
        if (r.code !== "200") {
            oa.log("Hardware read error. CONSIDER ERROR MANAGEMENT HERE");
            return;
        }

        // Hardware success
        oa.log("Controller data read", r.data);

        // Customize theme
        screen.customize(r.data.ui);

        initQR(r.data);
        screen.home.show();
    });
}

// -------------------------------------------------------------------
// APPLICATION INIT
// -------------------------------------------------------------------
window.onload = function () {

    // Language not defined or not supported ==> screen.start
    if (!localStorage[rom.prefix + "Lang"] || rom.languages.indexOf(localStorage[rom.prefix + "Lang"]) === -1) {
        screen.start.show();
        return;
    }

    // Set language
    ram.lang = localStorage[rom.prefix + "Lang"];
    oa.localize();

    // Set size
    ram.screen.width = oa.qs("#screens").offsetWidth;
    ram.screen.height = oa.qs("#screens").offsetHeight;
    ram.screen.qr = ram.screen.width * 0.35;
    ram.screen.logo = (ram.screen.width * 0.25) + "px";
    ram.screen.title = (ram.screen.width * 3 / 100) + "px";
    ram.screen.text = (ram.screen.width * 2 / 100) + "px";
    oa.qs("#home-logo").style.width = ram.screen.logo;
    oa.qs("#home-logo").style.height = ram.screen.logo;
    oa.qs("#home-title").style.fontSize = ram.screen.title;
    oa.qs("#home-text").style.fontSize = ram.screen.text;
    oa.qs("#result-logo").style.width = ram.screen.logo;
    oa.qs("#result-logo").style.height = ram.screen.logo;
    oa.qs("#result-title").style.fontSize = ram.screen.title;
    oa.qs("#result-text").style.fontSize = ram.screen.text;

    // Check network to continue
    checkNetwork();
}
// -------------------------------------------------------------------
// EoF
// -------------------------------------------------------------------
