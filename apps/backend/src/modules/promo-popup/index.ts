import PromoPopupModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PROMO_POPUP_MODULE = "promoPopup"

export default Module(PROMO_POPUP_MODULE, {
  service: PromoPopupModuleService,
})
