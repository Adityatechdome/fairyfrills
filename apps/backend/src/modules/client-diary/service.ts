import { MedusaService } from "@medusajs/framework/utils"
import ClientDiary from "./models/client-diary"

class ClientDiaryService extends MedusaService({ ClientDiary }) {}

export default ClientDiaryService
