/** ===================================================================
 * OAuthentic Physical Access Controller on Raspberry - Javascript Server
 * --------------------------------------------------------------------
 */

// -------------------------------------------------------------------
// MODULES
// -------------------------------------------------------------------
let src = {
    http: require('http'),
    si: require('systeminformation'), // See: https://systeminformation.io/
    shell: require('shelljs'), // https://github.com/shelljs/shelljs
    gpio: require('onoff').Gpio //include onoff to interact with the GPIO
};

// -------------------------------------------------------------------
// RELAY INIT - GPIO pin 23
// -------------------------------------------------------------------
let relay = new src.gpio(23, 'out'); //use GPIO pin 23
relay.writeSync(1);

// -------------------------------------------------------------------
// HTTP SERVER
// -------------------------------------------------------------------
src.http.createServer(function (req, res) {

    // Header
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST, GET, HEAD, PUT",
        "Access-Control-Max-Age": 3600,
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": true
    };

    /** --------------------------------------------------------------------
     * @function wjson
     * @description Write JSON data and send response
     * @param {object} data
     * @return N/A
     */
    function wjson(data) {
        res.write(JSON.stringify(data));
        res.end();
    }

    // OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    res.writeHead(200, headers);

    // GET: Only for test
    if (req.method !== "POST") {
        res.write("Raspberry API");
        res.end();
        return;
    }

    // POST: For all requests
    let body = "";
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', () => {
        let param = JSON.parse(body);

        // Switch API endpoint
        switch (param.rsc) {
            // Retrieve System and Network data
            case "network":
                src.si.system(function (system) {

                    console.log("🛡  System:", system);
                    src.si.networkInterfaces(function (iface) {

                        console.log("🛡  Interface:", iface);
                        src.si.inetChecksite("https://api.oauthentic.com").then(function (network) {

                            console.log("🛡  Network:", network);
                            wjson({
                                code: "200",
                                msg: "OK",
                                data: {
                                    system: system,
                                    network: network,
                                    interface: iface
                                }
                            });
                        });
                    }).catch(function (err) {
                        wjson({
                            code: "200",
                            msg: "OK",
                            data: err
                        });
                    });
                })
                break;
            // Exec Command
            case "shell":
                src.shell.exec(param.cmd);
                wjson({
                    code: "200",
                    msg: "OK",
                    data: ""
                });
                break;
            case "success":
                console.log("🛡  Relay enabled");
                relay.writeSync(0);
                setTimeout(function () {
                    console.log("🛡  Relay desabled");
                    relay.writeSync(1);
                }, param.time * 1000);
                wjson({
                    code: "200",
                    msg: "OK",
                    data: ""
                });
                break;
            // Unknown resource
            default:
                wjson({
                    code: "400",
                    msg: "Unknown resource",
                    data: ""
                });
        }
    });
}).listen(8080, function () {
    console.log("🛡  Server listening");
});
// ---------------------------------------------------------------------
//  EoF
// ---------------------------------------------------------------------