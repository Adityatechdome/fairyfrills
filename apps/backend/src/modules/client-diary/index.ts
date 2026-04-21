import ClientDiaryService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CLIENT_DIARY_MODULE = "clientDiary"

export default Module(CLIENT_DIARY_MODULE, {
  service: ClientDiaryService,
})
