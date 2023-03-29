import { Client } from "typing"
import Message from "./utilities/message"

const handlers: Record<string, (message: Message, client: Client) => void> = {}

export const register = (
  word: string,
  handler: (message: Message, client: Client) => void
) => {
  handlers[word] = handler
}

export const run = (message: Message, client: Client) => {
  const firstWord = message.body.split(" ")[0]!
  if (handlers[firstWord]) {
    try {
      handlers[firstWord]!(message, client)
    } catch (e) {
      console.log("Error running handler for " + firstWord)
      console.error(e)
    }
  }
}
