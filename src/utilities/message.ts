import { MessageUpsertType, proto } from "@adiwajshing/baileys"

export default class Message {
  from: string
  body: string

  constructor(raw: {
    messages: proto.IWebMessageInfo[]
    type: MessageUpsertType
  }) {
    this.from = raw.messages[0]?.key.remoteJid!
    this.body = raw.messages[0]?.message?.conversation!
  }
}
