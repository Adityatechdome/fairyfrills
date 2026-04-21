import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import TopSellerModule from "../modules/top-seller"

export default defineLink(
  ProductModule.linkable.product,
  {
    linkable: TopSellerModule.linkable.topSeller,
    deleteCascade: true,
  }
)
