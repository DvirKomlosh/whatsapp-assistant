import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
} from "@adiwajshing/baileys";
import type { Boom } from "@hapi/boom";
import * as ora from "ora";
import pino from "pino";

const spinner = ora("Initializing").start();

const connectToWhatsApp = async () => {
    const { state, saveCreds } = await useMultiFileAuthState(
        "auth_info_baileys"
    );

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "warn" }),
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const shouldReconnect =
                (lastDisconnect?.error as Boom)?.output?.statusCode !==
                DisconnectReason.loggedOut;

            // reconnect if not logged out
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === "open") {
            spinner.succeed("Bot connected");
        }
    });

    sock.ev.on("messages.upsert", async (message) => {
        // message listener
        if (
            message.type === "notify" &&
            message.messages[0]?.key.remoteJid === "972533320249@s.whatsapp.net"
        ) {
            await sock.sendMessage("972533320249@s.whatsapp.net", {
                text: "ACK",
            });
        }

        // Outgoing messages
        if (!message.messages[0]?.key.fromMe) {
            console.log(JSON.stringify(message, null, 2));
        } else {
            // Don't print
        }
    });
};

connectToWhatsApp();
