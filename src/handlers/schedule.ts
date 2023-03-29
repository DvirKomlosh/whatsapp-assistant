import * as schedule from "node-schedule"
import { Client } from "typing"
import { register } from "../parser"
import Message from "../utilities/message"

// SYNTAX: schedule <person> <day>/<month> <time>
const handle = (message: Message, client: Client) => {
  const split = message.body.split(" ")
  const person = split[1]

  const date = new Date()

  const [day, month] = split[2]!.split("/")
  date.setDate(parseInt(day!, 10))
  date.setMonth(parseInt(month!, 10) - 1)

  const [hour, minute] = split[3]!.split(":")
  date.setHours(parseInt(hour!, 10), parseInt(minute!, 10), 0)

  schedule.scheduleJob(date, () => {
    client.sendMessage(person!, { text: split.slice(4).join(" ") })
  })
}

register("תזמן", handle)
