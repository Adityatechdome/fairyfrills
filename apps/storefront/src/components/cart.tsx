import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { Price } from "@/components/ui/price"
import { Thumbnail } from "@/components/ui/thumbnail"
import {
  useCart,
  useDeleteLineItem,
  useUpdateLineItem,
  useApplyPromoCode,
  useRemovePromoCode,
} from "@/lib/hooks/use-cart"
import { sortCartItems } from "@/lib/utils/cart"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { getPricePercentageDiff } from "@/lib/utils/price"
import { useCartDrawer } from "@/lib/context/cart"
import { Minus, Plus, Trash, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Link, useLocation } from "@tanstack/react-router"
import { clsx } from "clsx"
import { useState } from "react"


type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
  className?: string
}

export const LineItemPrice = ({ item, currencyCode, className }: LineItemPriceProps) => {
  const { total, original_total } = item
  const originalPrice = original_total
  const currentPrice = total
  const hasReducedPrice = currentPrice && originalPrice && currentPrice < originalPrice

  return (
    <Price
      price={currentPrice || 0}
      currencyCode={currencyCode}
      originalPrice={
        hasReducedPrice
          ? {
              price: originalPrice || 0,
              percentage: getPricePercentageDiff(originalPrice || 0, currentPrice || 0),
            }
          : undefined
      }
      className={className}
    />
  )
}


type CartDeleteItemProps = {
  item: HttpTypes.StoreCartLineItem
  fields?: string
}

export const CartDeleteItem = ({ item, fields }: CartDeleteItemProps) => {
  const deleteLineItemMutation = useDeleteLineItem({ fields })
  return (
    <Button
      onClick={() => deleteLineItemMutation.mutate({ line_id: item.id })}
      disabled={deleteLineItemMutation.isPending}
      className="text-zinc-600 hover:text-zinc-500 transition-colors ml-2"
      variant="transparent"
      size="fit"
    >
      <Trash />
    </Button>
  )
}


type CartItemQuantitySelectorProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "default" | "compact"
  fields?: string
}

export const CartItemQuantitySelector = ({
  item,
  type = "default",
  fields,
}: CartItemQuantitySelectorProps) => {
  const updateLineItemMutation = useUpdateLineItem({ fields })
  const deleteLineItemMutation = useDeleteLineItem({ fields })

  const isBusy = updateLineItemMutation.isPending || deleteLineItemMutation.isPending

  const handleQuantityChange = (newQuantity: number) => {
    if (isBusy) return
    if (newQuantity <= 0) {
      deleteLineItemMutation.mutate({ line_id: item.id })
    } else {
      updateLineItemMutation.mutate({
        line_id: item.id,
        quantity: newQuantity,
      })
    }
  }

  return (
    <div className="flex items-center">
      <Button
        onClick={() => handleQuantityChange(item.quantity - 1)}
        disabled={isBusy}
        className={clsx(
          type === "compact" &&
            "text-zinc-600 hover:text-zinc-500 transition-colors p-1 ml-2"
        )}
        variant="transparent"
        size="fit"
      >
        <Minus />
      </Button>
      <span
        className={clsx(
          type === "compact"
            ? "text-sm text-zinc-900 text-center px-3"
            : "text-center text-sm px-6"
        )}
      >
        {item.quantity}
      </span>
      <Button
        onClick={() => handleQuantityChange(item.quantity + 1)}
        disabled={isBusy}
        className={clsx(
          type === "compact" &&
            "text-zinc-600 hover:text-zinc-500 transition-colors p-1 ml-2"
        )}
        variant="transparent"
        size="fit"
      >
        <Plus />
      </Button>
    </div>
  )
}


interface CartLineItemProps {
  item: HttpTypes.StoreCartLineItem
  cart: HttpTypes.StoreCart
  type?: "default" | "compact" | "display"
  fields?: string
  className?: string
}

const CompactCartLineItem = ({ item, cart, fields }: CartLineItemProps) => {
  const itemThumbnail = item.thumbnail || (item.variant as any)?.product?.thumbnail || (item.variant as any)?.product?.images?.[0]?.url
  const sizeFromVariant = item.variant_title && item.variant_title !== "Default Variant" ? item.variant_title : undefined
  const sizeFromMetadata = (item.metadata as any)?.size as string | undefined
  const momSize = (item.metadata as any)?.mom_size as string | undefined
  const displaySize = sizeFromVariant ?? sizeFromMetadata
  return (
    <div className="flex items-start gap-x-4" data-testid="cart-item">
      <Thumbnail thumbnail={itemThumbnail} alt={item.product_title || item.title} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-base font-medium line-clamp-1 text-zinc-900">
              {item.product_title}
            </h4>
            <div className="text-sm text-zinc-600 flex flex-col gap-0.5">
              {displaySize && (
                <span className="font-semibold text-zinc-800">Size: {displaySize}</span>
              )}
              {momSize && (
                <span className="font-semibold text-[var(--color-primary)]">Mom&apos;s Size: {momSize}</span>
              )}
            </div>
          </div>
          <CartDeleteItem item={item} fields={fields} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <CartItemQuantitySelector item={item} fields={fields} />
          <Price price={item.total || 0} currencyCode={cart.currency_code} textSize="small" />
        </div>
      </div>
    </div>
  )
}

const DisplayCartLineItem = ({ item, cart, className }: CartLineItemProps) => {
  const itemThumbnail = item.thumbnail || (item.variant as any)?.product?.thumbnail || (item.variant as any)?.product?.images?.[0]?.url
  const sizeFromVariant = item.variant_title && item.variant_title !== "Default Variant" ? item.variant_title : undefined
  const sizeFromMetadata = (item.metadata as any)?.size as string | undefined
  const momSize = (item.metadata as any)?.mom_size as string | undefined
  const displaySize = sizeFromVariant ?? sizeFromMetadata
  return (
    <div
      className={clsx(
        "flex items-center gap-4 py-3 border-b border-zinc-300 last:border-b-0",
        className
      )}
    >
      <Thumbnail
        thumbnail={itemThumbnail}
        alt={item.product_title || item.title}
        className="w-16 h-16"
      />
      <div className="flex-1">
        <p className="text-base font-semibold text-zinc-900">{item.product_title}</p>
        {displaySize && (
          <p className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">Size: {displaySize}</p>
        )}
        {momSize && (
          <p className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wide">Mom&apos;s Size: {momSize}</p>
        )}
        <p className="text-sm text-zinc-600">Quantity: {item.quantity}</p>
      </div>
      <div className="text-right">
        <Price price={item.total || 0} currencyCode={cart.currency_code} textWeight="plus" />
      </div>
    </div>
  )
}

export const CartLineItem = ({
  item,
  cart,
  type = "default",
  fields,
  className,
}: CartLineItemProps) => {
  if (type === "compact") {
    return <CompactCartLineItem item={item} cart={cart} fields={fields} className={className} />
  }

  if (type === "display") {
    return <DisplayCartLineItem item={item} cart={cart} className={className} />
  }

  const itemThumbnail = item.thumbnail || (item.variant as any)?.product?.thumbnail || (item.variant as any)?.product?.images?.[0]?.url
  const sizeFromVariant = item.variant_title && item.variant_title !== "Default Variant" ? item.variant_title : undefined
  const sizeFromMetadata = (item.metadata as any)?.size as string | undefined
  const momSize = (item.metadata as any)?.mom_size as string | undefined
  const displaySize = sizeFromVariant ?? sizeFromMetadata
  return (
    <div className="flex items-center gap-6 py-4">
      <div className="flex-shrink-0">
        <Thumbnail thumbnail={itemThumbnail} alt={item.product_title || item.title} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-y-1">
        <span className="text-zinc-900 text-base font-semibold">{item.product_title}</span>
        {displaySize && (
          <span className="text-zinc-800 text-sm font-semibold">Size: {displaySize}</span>
        )}
        {momSize && (
          <span className="text-sm font-semibold text-[var(--color-primary)]">Mom&apos;s Size: {momSize}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <CartItemQuantitySelector item={item} fields={fields} />

        <div className="text-right">
          <LineItemPrice item={item} currencyCode={cart.currency_code} />
        </div>

        <CartDeleteItem item={item} fields={fields} />
      </div>
    </div>
  )
}


interface CartSummaryProps {
  cart: HttpTypes.StoreCart
}

export const CartSummary = ({ cart }: CartSummaryProps) => {
  if ("isOptimistic" in cart && cart.isOptimistic) {
    return <Loading />
  }
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Subtotal</span>
          <Price
            price={cart.subtotal}
            currencyCode={cart.currency_code}
            className="text-zinc-600"
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Shipping</span>
          <Price
            price={cart.shipping_total}
            currencyCode={cart.currency_code}
            className="text-zinc-600"
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Discount</span>
          <Price
            price={cart.discount_total}
            currencyCode={cart.currency_code}
            type="discount"
            className="text-zinc-600"
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Tax</span>
          <Price
            price={cart.tax_total}
            currencyCode={cart.currency_code}
            className="text-zinc-600"
          />
        </div>
      </div>

      <hr className="bg-zinc-200" />

      <div className="flex justify-between text-sm">
        <span className="text-zinc-900">Total</span>
        <Price price={cart.total} currencyCode={cart.currency_code} className="text-zinc-900" />
      </div>
    </div>
  )
}


type CartPromoProps = {
  cart: HttpTypes.StoreCart
}

export const CartPromo = ({ cart }: CartPromoProps) => {
  const [showInput, setShowInput] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const applyPromoCodeMutation = useApplyPromoCode()
  const removePromoCodeMutation = useRemovePromoCode()

  const handleRemove = (code: string) => {
    removePromoCodeMutation.mutate({ code })
  }

  const handleApply = () => {
    applyPromoCodeMutation.mutate(
      { code: promoCode },
      {
        onSuccess: () => {
          setShowInput(false)
          setPromoCode("")
        },
      }
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {cart.promotions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cart.promotions.map((promotion) => (
            <Button key={promotion.code} variant="secondary" size="fit">
              {promotion.code}
              <XMark
                onClick={() => handleRemove(promotion.code || "")}
                className="ml-2 text-zinc-600 hover:text-zinc-500 cursor-pointer"
              />
            </Button>
          ))}
        </div>
      )}

      {!showInput && (
        <Button
          onClick={() => setShowInput(true)}
          variant="transparent"
          className="text-zinc-600 p-0 underline hover:bg-transparent hover:text-zinc-500"
          size="fit"
        >
          Add promo code
        </Button>
      )}

      {showInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Enter promo code"
            name="promoCode"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <Button onClick={handleApply} variant="primary" size="fit">
            Apply
          </Button>
          <Button onClick={() => setShowInput(false)} variant="secondary" size="fit">
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}


export const CartEmpty = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  return (
    <div className="text-center py-16 flex flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-bold text-[var(--color-text)]">Your cart is empty</h2>
      <p className="text-[var(--color-text-light)] text-base font-medium">Start by adding some products</p>
      <Link to="/$countryCode/store" params={{ countryCode }}>
        <Button variant="primary" size="fit">
          Continue shopping
        </Button>
      </Link>
    </div>
  )
}


export const DEFAULT_CART_DROPDOWN_FIELDS = "+items, +items.total, +items.metadata, +items.thumbnail, +items.variant.product.thumbnail, +items.variant.product.images.url, total, currency_code, item_subtotal, shipping_methods.name"

export const CART_PAGE_FIELDS =
  "+items, +items.total, +items.metadata, +items.thumbnail, +items.variant.product.thumbnail, +items.variant.product.images.url, total, currency_code, subtotal, shipping_total, discount_total, tax_total, +promotions"

export const CHECKOUT_FIELDS =
  "+items, +items.total, +items.metadata, +items.thumbnail, +items.variant.product.thumbnail, +items.variant.product.images.url, total, currency_code, subtotal, shipping_total, discount_total, tax_total, item_subtotal, +shipping_address, +billing_address, +shipping_methods, +payment_collection.payment_sessions, +region, +region.countries, +promotions, email"

export const CartDropdown = () => {
  const { isOpen, openCart, closeCart } = useCartDrawer()
  const { data: cart } = useCart({
    fields: DEFAULT_CART_DROPDOWN_FIELDS,
  })
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const sortedItems = sortCartItems(cart?.items || [])
  const itemCount = sortedItems?.reduce((total, item) => total + item.quantity, 0) || 0

  return (
    <Drawer open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <DrawerTrigger asChild>
        <button className="text-zinc-600 hover:text-zinc-500 h-full flex items-center gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
            className="w-5 h-5 fill-current"
            aria-hidden="true"
          >
            <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
          </svg>
          <span>({itemCount})</span>
        </button>
      </DrawerTrigger>

      <DrawerContent className="flex flex-col">
        <DrawerHeader>
          <DrawerTitle>Shopping Cart</DrawerTitle>
        </DrawerHeader>

        {/* Empty Cart */}
        {(!cart || itemCount === 0) && (
          <div className="flex flex-col items-center justify-center flex-1 p-6">
            <span className="text-base font-medium text-zinc-600 mb-4">
              Your cart is empty
            </span>
            <Link to="/$countryCode/store" params={{ countryCode }} onClick={closeCart}>
              <Button variant="secondary" size="fit">
                Explore products
              </Button>
            </Link>
          </div>
        )}

        {/* Cart Items */}
        {cart && itemCount > 0 && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {sortedItems?.map((item) => (
                <CartLineItem
                  key={item.id}
                  item={item}
                  cart={cart}
                  type="compact"
                  fields={DEFAULT_CART_DROPDOWN_FIELDS}
                />
              ))}
            </div>

            <DrawerFooter>
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-medium text-zinc-600">Subtotal</span>
                <Price price={cart.item_subtotal} currencyCode={cart.currency_code} />
              </div>

              <Link to="/$countryCode/checkout" params={{ countryCode }} search={{ step: "addresses" }} onClick={closeCart}>
                <Button className="w-full" variant="primary">
                  Proceed to checkout
                </Button>
              </Link>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}

// Default export for backwards compatibility
export default CartLineItem
