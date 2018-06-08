
/*
    Functions for simplifying some networking tasks
*/

import {Logger} from "./logger";
import {ParsedUrl} from "./parsed-url";

export class NetworkRatchet {
    private static LOCAL_IP : string = null;

    // https://ourcodeworld.com/articles/read/257/how-to-get-the-client-ip-address-with-javascript-only
    public static findLocalIp(useCache: boolean = true) : Promise<string>{
        if (NetworkRatchet.LOCAL_IP && useCache) {
            return Promise.resolve(NetworkRatchet.LOCAL_IP);
        }
        else {
            if (typeof window !== "undefined") {
                return new Promise<string>(function(resolve,reject){
                    //compatibility for firefox and chrome
                    // NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23
                    // Old was : window['RTCPeerConnection'] || window['mozRTCPeerConnection'] || window['webkitRTCPeerConnection'];
                    var myPeerConnection = window['webkitRTCPeerConnection'] || window['mozRTCPeerConnection'];
                    var pc = new myPeerConnection({
                            iceServers: []
                        }),
                        noop = function() {},
                        localIPs = {},
                        ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
                        key;

                    //create a bogus data channel
                    pc.createDataChannel("");

                    // create offer and set local description
                    pc.createOffer().then(function(sdp) {
                        sdp.sdp.split('\n').forEach(function(line) {
                            if (line.indexOf('candidate') < 0) return;
                            line.match(ipRegex).forEach((ip)=>{
                                if (!localIPs[ip]){
                                    NetworkRatchet.LOCAL_IP = ip;
                                    resolve(ip);
                                }
                                localIPs[ip] = true;
                            });
                        });

                        pc.setLocalDescription(sdp, noop, noop);
                    }).catch(function(reason) {
                        // An error occurred, so handle the failure to connect
                    });

                    //listen for candidate events
                    pc.onicecandidate = function(ice) {
                        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
                        ice.candidate.candidate.match(ipRegex).forEach((ip)=>{
                            if (!localIPs[ip]){
                                NetworkRatchet.LOCAL_IP = ip;
                                resolve(ip);
                            }
                            localIPs[ip] = true;
                        });
                    };
                })
            }
            else
            {
                Logger.warn("Window not found, cannot calculate local ip");
                NetworkRatchet.LOCAL_IP = "NO_WINDOW";
                return Promise.resolve(NetworkRatchet.LOCAL_IP);
            }
        }
    }

    public static parseUrl(href:string) : ParsedUrl {
        var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
        var rval : ParsedUrl =  match && {
            href: href,
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        } as ParsedUrl;
        return rval;
    }


}
