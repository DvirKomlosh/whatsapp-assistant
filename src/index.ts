import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from "@adiwajshing/baileys"
import type { Boom } from "@hapi/boom"
import { readdirSync } from "fs"
import * as ora from "ora"
import pino from "pino"
import { run } from "./parser"
import Message from "./utilities/message"

// Import all handlers
for (const file of readdirSync(__dirname + "/handlers")) {
  if (file.endsWith(".js")) {
    require("./handlers/" + file)
  }
}

const spinner = ora("Initializing").start()

const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys")

  const client = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "warn" }),
  })

  client.ev.on("creds.update", saveCreds)

  client.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut

      // reconnect if not logged out
      if (shouldReconnect) {
        connectToWhatsApp()
      }
    } else if (connection === "open") {
      spinner.succeed("Bot connected")
    }
  })

  client.ev.on("messages.upsert", async (m) => {
    const message = new Message(m)

    run(message, client)

    // Outgoing messages
    if (!m.messages[0]?.key.fromMe) {
      //   console.log( JSON.stringify(m, null, 2))
    } else {
      // Don't print
    }
  })
}

connectToWhatsApp()
