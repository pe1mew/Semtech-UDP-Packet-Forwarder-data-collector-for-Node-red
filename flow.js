[{"id":"e2f63d44.c64878","type":"tab","label":"Semtech UDP gateway receiver","disabled":true,"info":""},{"id":"710460b0.1ad0e8","type":"udp in","z":"e2f63d44.c64878","name":"TTN-Gateway monitor","iface":"","port":"1701","ipv":"udp4","multicast":"false","group":"","datatype":"buffer","x":160,"y":240,"wires":[["b9a65625.cb8f88","9f172b19.0f1708","591663b8.270f04"]]},{"id":"962ef0b1.07e5c","type":"udp out","z":"e2f63d44.c64878","name":"","addr":"","iface":"","port":"","ipv":"udp4","outport":"1701","base64":false,"multicast":"false","x":1010,"y":200,"wires":[]},{"id":"b9a65625.cb8f88","type":"function","z":"e2f63d44.c64878","name":"Semtech UDP rxpk Receiver","func":"// Protocol specific constants\nconst PROTOCOL = 0; // position of protocol version in raw payload\nconst PUSH_DAT = 3; // position of message type in raw payload\n\nconst PROTOCOL_VERSION   = 0x02;\n\nconst PKT_PUSH_DATA = 0;\nconst PKT_PUSH_ACK  = 1;\nconst PKT_PULL_DATA = 2;\nconst PKT_PULL_RESP = 3;\nconst PKT_PULL_ACK  = 4;\nconst PKT_TX_ACK    = 5;\n\n// Prepare minimum set of data for evaluation\nvar rawBufferSize = msg.payload.length;\nvar packetInformation = msg.payload.toString(\"ascii\" , 12, rawBufferSize);\n\n// Test for criteria before processing packet\n// 1: Payload size shall be greater than 1,\n// 2: Protocol shall be 2,\n// 3: received packet shall be of PUSH type.\nif((packetInformation.length > 1) && (msg.payload[PROTOCOL] === PROTOCOL_VERSION) && (msg.payload[PUSH_DAT] === PKT_PUSH_DATA)){\n        \n    var newPayload = {};\n    newPayload = JSON.parse(packetInformation);\n    \n    var gatewayEUI = msg.payload.toString(\"hex\" , 4, 12);\n    \n    msg.payload = newPayload;\n    msg.gatewayPacket = newPayload;\n    msg.gatewayEUI = gatewayEUI;\n    // return msg;\n    \n    if(typeof msg.payload.rxpk !== 'undefined') {\n        msg.payload = msg.payload.rxpk[0].data;\n        return msg;\n    }\n}\n\n\n\n\n","outputs":1,"noerr":0,"x":440,"y":280,"wires":[["4e604cde.765b3c"]],"info":"## Disclaimer  \n  This file is part of the Semtech UDP protocol receiver application.\n  \n  The Semtech UDP protocol receiver application is free software: \n  you can redistribute it and/or modify it under the terms of a Creative \n  Commons Attribution-NonCommercial 4.0 International License \n  (http://creativecommons.org/licenses/by-nc/4.0/) by \n  Remko Welling (http://rfsee.nl) E-mail: remko@rfsee.nl\n\n  The Semtech UDP protocol receiver application is distributed in the hope that \n  it will be useful, but WITHOUT ANY WARRANTY; without even the \n  implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR \n  PURPOSE.\n\n## Metadata\n\n\\brief get gateway count per datarate\n\\date See version history\n\\author Remko Welling (remko@rfsee.nl)\n\\version See version history\n\n## Version HIstory\n\nversion | Date      | Athour | Notes\n--------|-----------|--------|-----------------------------------\n1.0     | 1-1-20209 | PE1MEW | First release\n\n\n# Documentation\n\nFrom: https://github.com/Lora-net/packet_forwarder/blob/master/PROTOCOL.TXT\n\n ### 3.2. PUSH_DATA packet ###\nThat packet type is used by the gateway mainly to forward the RF packets \nreceived, and associated metadata, to the server.\n\n Bytes  | Function\n:------:|---------------------------------------------------------------------\n 0      | protocol version = 2\n 1-2    | random token\n 3      | PUSH_DATA identifier 0x00\n 4-11   | Gateway unique identifier (MAC address)\n 12-end | JSON object, starting with {, ending with }, see section 4\n\n### 3.3. PUSH_ACK packet ###\nThat packet type is used by the server to acknowledge immediately all the \nPUSH_DATA packets received.\n\n Bytes  | Function\n:------:|---------------------------------------------------------------------\n 0      | protocol version = 2\n 1-2    | same token as the PUSH_DATA packet to acknowledge\n 3      | PUSH_ACK identifier 0x01"},{"id":"4e604cde.765b3c","type":"exec","z":"e2f63d44.c64878","command":"lora-packet-decode --base64","addpay":true,"append":"","useSpawn":"false","timer":"5","oldrc":true,"name":"","x":610,"y":360,"wires":[["9025e905.e9a878"],[],[]],"info":"https://lorawan-packet-decoder-0ta6puiniaut.runkit.sh/"},{"id":"9eb722cc.415de","type":"mqtt out","z":"e2f63d44.c64878","name":"","topic":"","qos":"","retain":"","broker":"d9afedc9.bf67b8","x":1010,"y":260,"wires":[]},{"id":"9f172b19.0f1708","type":"function","z":"e2f63d44.c64878","name":"Semtech UDP acknowledge","func":"const PROTOCOL = 0;\nconst PUSH_DAT = 3;\n\nconst PROTOCOL_VERSION   = 0x02;\n\nconst PKT_PUSH_DATA = 0;\nconst PKT_PUSH_ACK  = 1;\nconst PKT_PULL_DATA = 2;\nconst PKT_PULL_RESP = 3;\nconst PKT_PULL_ACK  = 4;\nconst PKT_TX_ACK    = 5;\n\nvar newHeader = Buffer.alloc(4, 0);\nfor (var i = 0; i < 4; i++){\n    newHeader[i] = msg.payload[i];\n}\n\nif(newHeader[PROTOCOL] == PROTOCOL_VERSION){\n    switch(msg.payload[PUSH_DAT])\n    {\n        case PKT_PUSH_DATA:\n            newHeader[PUSH_DAT] = PKT_PUSH_ACK;\n            break;\n            \n        case PKT_PULL_DATA:\n            newHeader[PUSH_DAT] = PKT_PULL_ACK;\n            break;\n            \n        default:\n            // add error message.\n            break;\n    }\n    \n    msg.payload = newHeader;\n    return msg;\n}\n","outputs":1,"noerr":0,"x":440,"y":200,"wires":[["962ef0b1.07e5c"]],"info":"## Disclaimer  \n  This file is part of the Semtech UDP protocol receiver application.\n  \n  The Semtech UDP protocol receiver application is free software: \n  you can redistribute it and/or modify it under the terms of a Creative \n  Commons Attribution-NonCommercial 4.0 International License \n  (http://creativecommons.org/licenses/by-nc/4.0/) by \n  Remko Welling (http://rfsee.nl) E-mail: remko@rfsee.nl\n\n  The Semtech UDP protocol receiver application is distributed in the hope that \n  it will be useful, but WITHOUT ANY WARRANTY; without even the \n  implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR \n  PURPOSE.\n\n## Metadata\n\n\\brief get gateway count per datarate\n\\date See version history\n\\author Remko Welling (remko@rfsee.nl)\n\\version See version history\n\n## Version HIstory\n\nversion | Date      | Athour | Notes\n--------|-----------|--------|-----------------------------------\n1.0     | 1-1-2020 | PE1MEW | First release\n\n\n# Documentation\n\nFrom: https://github.com/Lora-net/packet_forwarder/blob/master/PROTOCOL.TXT\n\n \n### 3.2. PUSH_DATA packet ###\n\nThat packet type is used by the gateway mainly to forward the RF packets \nreceived, and associated metadata, to the server.\n\n Bytes  | Function\n:------:|---------------------------------------------------------------------\n 0      | protocol version = 2\n 1-2    | random token\n 3      | PUSH_DATA identifier 0x00\n 4-11   | Gateway unique identifier (MAC address)\n 12-end | JSON object, starting with {, ending with }, see section 4\n\n### 3.3. PUSH_ACK packet ###\n\nThat packet type is used by the server to acknowledge immediately all the \nPUSH_DATA packets received.\n\n Bytes  | Function\n:------:|---------------------------------------------------------------------\n 0      | protocol version = 2\n 1-2    | same token as the PUSH_DATA packet to acknowledge\n 3      | PUSH_ACK identifier 0x01\n \n### 5.2. PULL_DATA packet ###\n\nThat packet type is used by the gateway to poll data from the server.\n\nThis data exchange is initialized by the gateway because it might be \nimpossible for the server to send packets to the gateway if the gateway is \nbehind a NAT.\n\nWhen the gateway initialize the exchange, the network route towards the \nserver will open and will allow for packets to flow both directions.\nThe gateway must periodically send PULL_DATA packets to be sure the network \nroute stays open for the server to be used at any time.\n\n Bytes  | Function\n:------:|---------------------------------------------------------------------\n 0      | protocol version = 2\n 1-2    | random token\n 3      | PULL_DATA identifier 0x02\n 4-11   | Gateway unique identifier (MAC address)\n\n### 5.3. PULL_ACK packet ###\n\nThat packet type is used by the server to confirm that the network route is \nopen and that the server can send PULL_RESP packets at any time.\n\n Bytes  | Function\n:------:|---------------------------------------------------------------------\n 0      | protocol version = 2\n 1-2    | same token as the PULL_DATA packet to acknowledge\n 3      | PULL_ACK identifier 0x04"},{"id":"591663b8.270f04","type":"function","z":"e2f63d44.c64878","name":"Semtech UDP stat Receiver","func":"// Protocol specific constants\nconst PROTOCOL = 0; // position of protocol version in raw payload\nconst PUSH_DAT = 3; // position of message type in raw payload\n\nconst PROTOCOL_VERSION   = 0x02;\n\nconst PKT_PUSH_DATA = 0;\nconst PKT_PUSH_ACK  = 1;\nconst PKT_PULL_DATA = 2;\nconst PKT_PULL_RESP = 3;\nconst PKT_PULL_ACK  = 4;\nconst PKT_TX_ACK    = 5;\n\n// Prepare minimum set of data for evaluation\nvar rawBufferSize = msg.payload.length;\nvar packetInformation = msg.payload.toString(\"ascii\" , 12, rawBufferSize);\n\n// Test for criteria before processing packet\n// 1: Payload size shall be greater than 1,\n// 2: Protocol shall be 2,\n// 3: received packet shall be of PUSH type.\nif((packetInformation.length > 1) && (msg.payload[PROTOCOL] === PROTOCOL_VERSION) && (msg.payload[PUSH_DAT] === PKT_PUSH_DATA)){\n        \n    var newPayload = {};\n    newPayload = JSON.parse(packetInformation);\n    \n    var gatewayEUI = msg.payload.toString(\"hex\" , 4, 12);\n    \n    msg.payload = newPayload;\n    msg.gatewayPacket = newPayload;\n    msg.gatewayEUI = gatewayEUI;\n    // return msg;\n    \n    if(typeof msg.payload.stat !== 'undefined') {\n        return msg;\n    }\n}\n\n\n\n\n","outputs":1,"noerr":0,"x":440,"y":240,"wires":[["3d2d5c66.5d7604"]],"info":"## Disclaimer  \n  This file is part of the Semtech UDP protocol receiver application.\n  \n  The Semtech UDP protocol receiver application is free software: \n  you can redistribute it and/or modify it under the terms of a Creative \n  Commons Attribution-NonCommercial 4.0 International License \n  (http://creativecommons.org/licenses/by-nc/4.0/) by \n  Remko Welling (http://rfsee.nl) E-mail: remko@rfsee.nl\n\n  The Semtech UDP protocol receiver application is distributed in the hope that \n  it will be useful, but WITHOUT ANY WARRANTY; without even the \n  implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR \n  PURPOSE.\n\n## Metadata\n\n\\brief get gateway count per datarate\n\\date See version history\n\\author Remko Welling (remko@rfsee.nl)\n\\version See version history\n\n## Version HIstory\n\nversion | Date      | Athour | Notes\n--------|-----------|--------|-----------------------------------\n1.0     | 1-1-20209 | PE1MEW | First release\n\n\n# Documentation\n\nFrom: https://github.com/Lora-net/packet_forwarder/blob/master/PROTOCOL.TXT\n\n### 3.2. PUSH_DATA packet ###\nThat packet type is used by the gateway mainly to forward the RF packets \nreceived, and associated metadata, to the server.\n\n Bytes  | Function\n:------:|---------------------------------------------------------------------\n 0      | protocol version = 2\n 1-2    | random token\n 3      | PUSH_DATA identifier 0x00\n 4-11   | Gateway unique identifier (MAC address)\n 12-end | JSON object, starting with {, ending with }, see section 4\n\n### 3.3. PUSH_ACK packet ###\nThat packet type is used by the server to acknowledge immediately all the \nPUSH_DATA packets received.\n\n Bytes  | Function\n:------:|---------------------------------------------------------------------\n 0      | protocol version = 2\n 1-2    | same token as the PUSH_DATA packet to acknowledge\n 3      | PUSH_ACK identifier 0x01"},{"id":"3d2d5c66.5d7604","type":"function","z":"e2f63d44.c64878","name":"MQTT stat data formatter","func":"msg.qos = 0;\nmsg.retain = false;\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/stat/raw\";\nmsg.payload = JSON.stringify(msg.gatewayPacket);\nnode.send(msg);\n\nfor (var key in msg.gatewayPacket.stat){\n    // msg2.topic = \"kpn/\" + msg.devEUI + \"/location/\" + key;\n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/stat/\" + key;\n    msg.payload = msg.gatewayPacket.stat[key];\n    node.send(msg);\n}\n","outputs":1,"noerr":0,"x":770,"y":240,"wires":[["9eb722cc.415de"]],"info":"## Disclaimer  \n  This file is part of the Semtech UDP protocol receiver application.\n  \n  The Semtech UDP protocol receiver application is free software: \n  you can redistribute it and/or modify it under the terms of a Creative \n  Commons Attribution-NonCommercial 4.0 International License \n  (http://creativecommons.org/licenses/by-nc/4.0/) by \n  Remko Welling (http://rfsee.nl) E-mail: remko@rfsee.nl\n\n  The Semtech UDP protocol receiver application is distributed in the hope that \n  it will be useful, but WITHOUT ANY WARRANTY; without even the \n  implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR \n  PURPOSE.\n\n## Metadata\n\n\\brief get gateway count per datarate\n\\date See version history\n\\author Remko Welling (remko@rfsee.nl)\n\\version See version history\n\n## Version HIstory\n\nversion | Date      | Athour | Notes\n--------|-----------|--------|-----------------------------------\n1.0     | 1-1-20209 | PE1MEW | First release\n1.1     | 9-1-2019  | PE1MEW | Corrections \n\n\n# Documentation\n\nFrom: https://github.com/Lora-net/packet_forwarder/blob/master/PROTOCOL.TXT\n\n Name |  Type  | Function\n:----:|:------:|--------------------------------------------------------------\n time | string | UTC 'system' time of the gateway, ISO 8601 'expanded' format\n lati | number | GPS latitude of the gateway in degree (float, N is +)\n long | number | GPS latitude of the gateway in degree (float, E is +)\n alti | number | GPS altitude of the gateway in meter RX (integer)\n rxnb | number | Number of radio packets received (unsigned integer)\n rxok | number | Number of radio packets received with a valid PHY CRC\n rxfw | number | Number of radio packets forwarded (unsigned integer)\n ackr | number | Percentage of upstream datagrams that were acknowledged\n dwnb | number | Number of downlink datagrams received (unsigned integer)\n txnb | number | Number of packets emitted (unsigned integer)\n"},{"id":"9025e905.e9a878","type":"function","z":"e2f63d44.c64878","name":"MQTT rxpk data formatter","func":"// Set parameters fro MQTT \nmsg.qos = 0;\nmsg.retain = false;\n\n// Capture decode payload for future use.\nvar decodedPayload = msg.payload;\n\n// Send raw rxpk packet to MQTT\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/raw\";\nmsg.payload = JSON.stringify(msg.gatewayPacket);\nnode.send(msg);\n\n// Send details of received rxpk packet to differente topics.\n\n// \\todo convert to MySQL compatible time\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/time\";\nmsg.payload = msg.gatewayPacket.time;\nnode.send(msg);\n\n// \\todo make this loop depending on the amount of objects\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/data\";\nmsg.payload = msg.gatewayPacket.rxpk[0].data; \nnode.send(msg);\n\n// \\todo convert unix time in seconds to MySQL compatible time\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/tmst\";\nmsg.payload = msg.gatewayPacket.rxpk[0].tmst.toString().trim();\nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/chan\";\nmsg.payload = msg.gatewayPacket.rxpk[0].chan.toString().trim(); \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/rfch\";\nmsg.payload = msg.gatewayPacket.rxpk[0].rfch.toString().trim(); \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/freq\";\nmsg.payload = msg.gatewayPacket.rxpk[0].freq.toString().trim(); \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/stat\";\nmsg.payload = msg.gatewayPacket.rxpk[0].stat.toString().trim(); \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/modu\";\nmsg.payload = msg.gatewayPacket.rxpk[0].modu; \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/datr\";\nmsg.payload = msg.gatewayPacket.rxpk[0].datr; \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/codr\";\nmsg.payload = msg.gatewayPacket.rxpk[0].codr; \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/lsnr\";\nmsg.payload = msg.gatewayPacket.rxpk[0].lsnr.toString().trim(); \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/rssi\";\nmsg.payload = msg.gatewayPacket.rxpk[0].rssi.toString().trim(); \nnode.send(msg);\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/size\";\nmsg.payload = msg.gatewayPacket.rxpk[0].size.toString().trim(); \nnode.send(msg);\n\n// Send raw decoded payload to MQTT\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/raw\";\nmsg.payload = decodedPayload; \nnode.send(msg);\n\n// Send specific decoded data to MQTT topics ande relate to device address\n\nmsg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/MessageType\";\noffset1 = decodedPayload.indexOf(\"Message Type = \");\nvar messageType = decodedPayload.substr(offset1+15, 15).trim();\nmsg.payload = messageType;\nnode.send(msg);\n\nif (messageType == \"Join Request\"){\n\n    // JOIN REQUEST\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/AppEUI\";\n    offset = decodedPayload.search(\"AppEUI =\");\n    msg.payload = decodedPayload.substr(offset+9, 16).trim();\n    node.send(msg);\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/DevEUI\";\n    offset = decodedPayload.search(\"DevEUI =\");\n    msg.payload = decodedPayload.substr(offset+9, 16).trim();\n    node.send(msg);\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/DevNonce\";\n    offset = decodedPayload.search(\"DevNonce =\");\n    msg.payload = decodedPayload.substr(offset+11, 4).trim();\n    node.send(msg);\n}else if (messageType == \"Data\"){\n    \n    // DATA types\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/devaddr\";\n    offset = decodedPayload.search(\"DevAddr =\");\n    var devAddr = decodedPayload.substr(offset+10, 8).trim();\n    msg.payload = devAddr;\n    node.send(msg);\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/\" + devAddr +\"/FCnt\";\n    offset1 = decodedPayload.indexOf(\"FCnt =\"),\n    offset2 = decodedPayload.indexOf(\"FCnt =\", offset1+1);\n    msg.payload = decodedPayload.substr(offset2+7, 9).trim();\n    node.send(msg);\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/\" + devAddr +\"/FPort\";\n    offset = decodedPayload.search(\"FPort =\");\n    msg.payload = decodedPayload.substr(offset+8, 8).trim();\n    node.send(msg);\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/\" + devAddr +\"/MsgType\";\n    offset1 = decodedPayload.indexOf(\"Message Type = \"),\n    offset2 = decodedPayload.indexOf(\"Message Type = \", offset1+1);\n    msg.payload = decodedPayload.substr(offset2+15, 28).trim();\n    node.send(msg);\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/\" + devAddr +\"/FCtrlACK\";\n    offset = decodedPayload.search(\"FCtrl.ACK =\");\n    msg.payload = decodedPayload.substr(offset+12, 8).trim();\n    node.send(msg);\n    \n    msg.topic = \"loramonitor/\" + msg.gatewayEUI + \"/rxpk/decoded/\" + messageType + \"/\" + devAddr +\"/FCtrlADR\";\n    offset = decodedPayload.search(\"FCtrl.ADR =\");\n    msg.payload = decodedPayload.substr(offset+12, 8).trim();\n    node.send(msg);\n\n}","outputs":1,"noerr":0,"x":770,"y":280,"wires":[["9eb722cc.415de"]],"info":"## Disclaimer  \n  This file is part of the Semtech UDP protocol receiver application.\n  \n  The Semtech UDP protocol receiver application is free software: \n  you can redistribute it and/or modify it under the terms of a Creative \n  Commons Attribution-NonCommercial 4.0 International License \n  (http://creativecommons.org/licenses/by-nc/4.0/) by \n  Remko Welling (http://rfsee.nl) E-mail: remko@rfsee.nl\n\n  The Semtech UDP protocol receiver application is distributed in the hope that \n  it will be useful, but WITHOUT ANY WARRANTY; without even the \n  implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR \n  PURPOSE.\n\n## Metadata\n\n\\brief get gateway count per datarate\n\\date See version history\n\\author Remko Welling (remko@rfsee.nl)\n\\version See version history\n\n## Version HIstory\n\nversion | Date      | Athour | Notes\n--------|-----------|--------|-----------------------------------\n1.0     | 1-1-20209 | PE1MEW | First release\n1.1    | 9-1-2019  | PE1MEW | Corrections \n\n\n# Documentation\n\nFrom: https://github.com/Lora-net/packet_forwarder/blob/master/PROTOCOL.TXT\n\n Name |  Type  | Function\n:----:|:------:|--------------------------------------------------------------\n time | string | UTC 'system' time of the gateway, ISO 8601 'expanded' format\n lati | number | GPS latitude of the gateway in degree (float, N is +)\n long | number | GPS latitude of the gateway in degree (float, E is +)\n alti | number | GPS altitude of the gateway in meter RX (integer)\n rxnb | number | Number of radio packets received (unsigned integer)\n rxok | number | Number of radio packets received with a valid PHY CRC\n rxfw | number | Number of radio packets forwarded (unsigned integer)\n ackr | number | Percentage of upstream datagrams that were acknowledged\n dwnb | number | Number of downlink datagrams received (unsigned integer)\n txnb | number | Number of packets emitted (unsigned integer)"},{"id":"febe639c.dff6d","type":"comment","z":"e2f63d44.c64878","name":"Receive Semtech UDP packets with complete handshake and post to MQTT","info":"## Disclaimer  \n  This file is part of the Semtech UDP protocol receiver application.\n  \n  The Semtech UDP protocol receiver application is free software: \n  you can redistribute it and/or modify it under the terms of a Creative \n  Commons Attribution-NonCommercial 4.0 International License \n  (http://creativecommons.org/licenses/by-nc/4.0/) by \n  Remko Welling (http://rfsee.nl) E-mail: remko@rfsee.nl\n\n  The Semtech UDP protocol receiver application is distributed in the hope that \n  it will be useful, but WITHOUT ANY WARRANTY; without even the \n  implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR \n  PURPOSE.\n\n## Metadata\n\n\\brief get gateway count per datarate\n\\date See version history\n\\author Remko Welling (remko@rfsee.nl)\n\\version See version history\n\n## Version HIstory\n\nversion | Date      | Athour | Notes\n--------|-----------|--------|-----------------------------------\n1.0     | 1-1-20209 | PE1MEW | First release\n1.1     | 9-1-2019  | PE1MEW | Corrections \n","x":610,"y":140,"wires":[]},{"id":"d9afedc9.bf67b8","type":"mqtt-broker","z":"","name":"","broker":"yourbroker.org","port":"1883","clientid":"","usetls":false,"compatmode":false,"keepalive":"60","cleansession":true,"birthTopic":"","birthQos":"0","birthPayload":"","closeTopic":"","closeQos":"0","closePayload":"","willTopic":"","willQos":"0","willPayload":""}]