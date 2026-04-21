import { MedusaContainer } from "@medusajs/framework/types"

/**
 * Seeds all custom module data on first startup.
 * Checks if data exists before creating - safe to re-run.
 */
export default async function seedDataJob(container: MedusaContainer) {
  const logger = container.resolve("logger")

  try {
    await seedHeroBanners(container, logger)
    await seedAnnouncements(container, logger)
    await seedMarquee(container, logger)
    await seedFooterContent(container, logger)
    await seedFooterLinks(container, logger)
    await seedTestimonials(container, logger)
    await seedFaqs(container, logger)
    await seedBlogPosts(container, logger)
    await seedContentPages(container, logger)
    await seedSiteSettings(container, logger)
    await seedClientDiaries(container, logger)
    await seedClientFeedback(container, logger)
    logger.info("[seed-data] Seed check complete.")
  } catch (err) {
    logger.error("[seed-data] Error during seeding:", err)
  }
}

export const config = {
  name: "seed-data",
  schedule: "* * * * *",
  numberOfExecutions: 1,
}

async function seedHeroBanners(container: any, logger: any) {
  const service = container.resolve("heroBanner")
  const existing = await service.listHeroBanners({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding hero banners...")
  await service.createHeroBanners([
    {
      image_url:
        "https://virtualtryonfairyfrills.blob.core.windows.net/dressesvirtualtryonfairyfrills/final.jpg",
      mobile_image_url: null,
      order: 0,
      is_active: true,
    },
  ])
}

async function seedAnnouncements(container: any, logger: any) {
  const service = container.resolve("announcement")
  const existing = await service.listAnnouncements({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding announcements...")
  await service.createAnnouncements([
    {
      message: "Free Shipping on Orders Above Rs.999!",
      is_active: true,
      order: 1,
    },
    {
      message: "New Arrivals Every Week - Shop Now!",
      is_active: true,
      order: 2,
    },
  ])
}

async function seedMarquee(container: any, logger: any) {
  const service = container.resolve("marquee")
  const existing = await service.listMarquees({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding marquee...")
  await service.createMarquees({
    text_items: [
      "COMFORT",
      "GLOBAL DELIVERY",
      "ECO-FRIENDLY",
      "HANDCRAFTED WITH LOVE",
      "LUXURY IN EVERY LAYER",
      "MADE FOR CELEBRATIONS",
      "FLAT 50%",
    ],
    is_active: true,
  })
}

async function seedFooterContent(container: any, logger: any) {
  const service = container.resolve("footerContent")
  const existing = await service.listFooterContents({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding footer content...")
  await service.createFooterContents({
    brand_description:
      "Fairy Frills is a designer clothing brand creating handcrafted baby girl dresses and elegant mother daughter twinning outfits for life's most special moments.",
    instagram_url: "https://www.instagram.com/fairyfrillsai",
    youtube_url: "https://www.youtube.com/@fairyfrillsai",
    facebook_url: "https://www.facebook.com/fairyfrills",
    email: "info@fairyfrills.in",
    phone: "+91-9244231364",
    is_active: true,
  })
}

async function seedFooterLinks(container: any, logger: any) {
  const service = container.resolve("footerLinks")
  const existing = await service.listFooterLinks({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding footer links...")
  await service.createFooterLinks([
    { label: "Contact Us", url: "/in/contact", column: "company_info", sort_order: 1, is_active: true },
    { label: "About Us", url: "/in/about", column: "company_info", sort_order: 2, is_active: true },
    { label: "Blogs", url: "/in/blogs", column: "company_info", sort_order: 3, is_active: true },
    { label: "FAQs", url: "/in/faqs", column: "company_info", sort_order: 4, is_active: true },
    { label: "Terms & Condition", url: "/in/terms", column: "company_policies", sort_order: 1, is_active: true },
    { label: "Shipping Policy", url: "/in/shipping-policy", column: "company_policies", sort_order: 2, is_active: true },
    { label: "Privacy Policy", url: "/in/privacy-policy", column: "company_policies", sort_order: 3, is_active: true },
  ])
}

async function seedTestimonials(container: any, logger: any) {
  const service = container.resolve("testimonial")
  const existing = await service.listTestimonials({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding testimonials...")
  await service.createTestimonials([
    {
      customer_name: "Pannakara Saikiran",
      review_text:
        "The birthday dress I ordered for my daughter was absolutely stunning! The craftsmanship and attention to detail were incredible. She looked like a little princess.",
      rating: 5,
      order: 1,
      is_active: true,
    },
    {
      customer_name: "Snehy Guptha",
      review_text:
        "We ordered the mother-daughter combo for a family photoshoot. The fabric quality is premium and the fit was perfect. Got so many compliments!",
      rating: 5,
      order: 2,
      is_active: true,
    },
    {
      customer_name: "Rekha Patel",
      review_text:
        "Fairy Frills never disappoints! This is our third order and every dress has been beautifully handcrafted. The delivery was also very prompt.",
      rating: 4,
      order: 3,
      is_active: true,
    },
  ])
}

async function seedFaqs(container: any, logger: any) {
  const service = container.resolve("faq")
  const existing = await service.listFaqs({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding FAQs...")
  await service.createFaqs([
    {
      question: "Do you offer express delivery for urgent occasions?",
      answer:
        "Yes! We offer express delivery (2-3 business days) for those last-minute celebrations. Same-day delivery is also available in select cities for orders placed before 12 PM. Additional shipping charges may apply for express services.",
      category: "Orders & Shipping",
      sort_order: 1,
      is_active: true,
    },
    {
      question: "Can I customize a dress for my child?",
      answer:
        "Absolutely! We offer customization services for most of our dresses. You can choose fabric colors, add embellishments, adjust sizing, and even request unique design modifications. Please allow an additional 5-7 business days for custom orders. Contact us with your requirements for a personalized quote.",
      category: "Customization & Style",
      sort_order: 1,
      is_active: true,
    },
    {
      question: "How long does it take to receive my order?",
      answer:
        "Standard delivery takes 5-7 business days across India. Express shipping delivers within 2-3 business days. Processing time is 2-3 business days before shipping. You will receive a tracking number once your order ships.",
      category: "Orders & Shipping",
      sort_order: 2,
      is_active: true,
    },
    {
      question: "Do you offer mother daughter twinning outfits?",
      answer:
        "Yes, we do! Our Mother & Daughter Combos collection features beautifully coordinated outfits designed for those special twinning moments. From matching dresses to complementary styles, we have options perfect for photoshoots, celebrations, and everyday wear.",
      category: "Customization & Style",
      sort_order: 2,
      is_active: true,
    },
    {
      question: "Are there any shipping charges?",
      answer:
        "We offer free standard shipping on all orders above Rs. 999. For orders below Rs. 999, a flat shipping fee of Rs. 99 applies. Express shipping is available at an additional charge based on your location.",
      category: "Orders & Shipping",
      sort_order: 3,
      is_active: true,
    },
    {
      question: "Do you ship globally?",
      answer:
        "Currently, we primarily ship across India. For international orders, please contact us at support@fairyfrills.com and we will do our best to accommodate your request. International shipping charges and delivery times vary by destination.",
      category: "Orders & Shipping",
      sort_order: 4,
      is_active: true,
    },
  ])
}

async function seedBlogPosts(container: any, logger: any) {
  const service = container.resolve("blogPost")
  const existing = await service.listBlogPosts({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding blog posts...")
  await service.createBlogPosts([
    {
      title: "Top 5 Birthday Dress Trends for Little Girls in 2025",
      slug: "birthday-dress-trends-2025",
      excerpt:
        "Discover the most adorable birthday dress trends for your little princess this year, from pastel tulle gowns to sparkling sequin details.",
      content: `<h2>Top 5 Birthday Dress Trends for Little Girls in 2025</h2>

<p>Every birthday deserves a show-stopping outfit! Here are the top dress trends making waves in kids' fashion this year.</p>

<h3>1. Pastel Tulle Dreams</h3>
<p>Soft pastel tulle dresses in lavender, blush pink, and mint green continue to dominate birthday party fashion. These ethereal gowns feature multiple layers of soft tulle, creating a fairy-tale silhouette that every little girl dreams of.</p>

<h3>2. Floral Embroidery</h3>
<p>Hand-embroidered floral details add a touch of elegance to any birthday dress. From delicate daisies to bold roses, floral embroidery transforms a simple dress into a work of art.</p>

<h3>3. Sequin Accents</h3>
<p>A touch of sparkle goes a long way! Sequin bodices paired with flowing skirts create the perfect balance of glamour and comfort for active little ones.</p>

<h3>4. Vintage-Inspired Silhouettes</h3>
<p>Classic A-line shapes with peter pan collars and puffed sleeves are making a comeback, offering timeless elegance with a modern twist.</p>

<h3>5. Matching Accessories</h3>
<p>Complete the birthday look with matching headbands, shoes, and clutches. Coordinated accessories elevate the entire outfit.</p>

<p>At Fairy Frills, we handcraft each dress with love, ensuring your little one looks and feels magical on her special day.</p>`,
      thumbnail_url:
        "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KJQ3RAZ4RTE0QN6SEA6CY0JR-01KJQ3RAZ4Z7CMWAG7V7C1RWTQ.jpeg",
      author: "Fairy Frills Team",
      is_active: true,
      published_at: new Date("2025-02-15"),
      sort_order: 1,
    },
    {
      title: "The Ultimate Guide to Mother-Daughter Twinning Outfits",
      slug: "mother-daughter-twinning-guide",
      excerpt:
        "Create unforgettable memories with perfectly coordinated mother-daughter outfits for every occasion, from casual outings to grand celebrations.",
      content: `<h2>The Ultimate Guide to Mother-Daughter Twinning Outfits</h2>

<p>There's something magical about matching with your mini-me. Mother-daughter twinning outfits have become a beloved fashion trend that celebrates the special bond between a mom and her little girl.</p>

<h3>Why Twinning is Trending</h3>
<p>Matching outfits create beautiful photo opportunities and strengthen the connection between mother and daughter. Whether it's a festive celebration or a simple day out, coordinated looks make every moment picture-perfect.</p>

<h3>Choosing the Right Style</h3>
<p>The key to great twinning outfits is finding styles that flatter both adult and child proportions. Look for designs that share the same fabric and color palette while adapting the silhouette for each body type.</p>

<h3>Occasions for Twinning</h3>
<ul>
<li><strong>Festivals:</strong> Traditional outfits in matching fabrics</li>
<li><strong>Birthdays:</strong> Coordinated party dresses</li>
<li><strong>Photoshoots:</strong> Matching ethereal gowns</li>
<li><strong>Casual Days:</strong> Complementary sundresses or kurtas</li>
</ul>

<h3>Styling Tips</h3>
<p>Don't be afraid to add matching accessories like hair clips, bangles, or sandals. Small details make the twinning look complete and extra special.</p>

<p>Explore our Mother & Daughter Combos collection at Fairy Frills for handcrafted twinning outfits that celebrate your beautiful bond.</p>`,
      thumbnail_url:
        "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KJQ3RQ3YTBN4EFMWEGBFVK5S-01KJQ3RQ3ZZ0K1MH2F2S7GHEPR.jpeg",
      author: "Fairy Frills Team",
      is_active: true,
      published_at: new Date("2025-03-01"),
      sort_order: 2,
    },
  ])
}

async function seedContentPages(container: any, logger: any) {
  const service = container.resolve("contentPage")
  const existing = await service.listContentPages({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding content pages...")
  await service.createContentPages([
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content: `<h2>Privacy Policy</h2>
<p>At Fairy Frills, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website or make a purchase.</p>

<h3>Information We Collect</h3>
<p>We collect information that you provide directly to us, including your name, email address, shipping address, phone number, and payment information when you place an order. We also collect browsing data to improve your shopping experience.</p>

<h3>How We Use Your Information</h3>
<p>Your information is used to process orders, communicate about your purchases, send promotional offers (with your consent), and improve our website and services.</p>

<h3>Data Security</h3>
<p>We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology.</p>

<h3>Third-Party Sharing</h3>
<p>We do not sell your personal information. We may share data with trusted service providers who assist in operating our website, conducting our business, or servicing you.</p>

<h3>Your Rights</h3>
<p>You have the right to access, correct, or delete your personal data. Contact us at support@fairyfrills.com for any privacy-related requests.</p>

<h3>Updates to This Policy</h3>
<p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>`,
      is_active: true,
    },
    {
      slug: "shipping-policy",
      title: "Shipping Policy",
      content: `<h2>Shipping Policy</h2>
<p>Thank you for shopping with Fairy Frills! We want to ensure your little one's outfits arrive safely and on time.</p>

<h3>Processing Time</h3>
<p>All orders are processed within 2-3 business days. Orders placed on weekends or holidays will be processed on the next business day.</p>

<h3>Shipping Rates & Delivery Times</h3>
<p><strong>Standard Shipping:</strong> 5-7 business days. Free on orders above Rs. 999.</p>
<p><strong>Express Shipping:</strong> 2-3 business days. Available at an additional charge.</p>
<p><strong>Same-Day Delivery:</strong> Available in select cities for orders placed before 12 PM.</p>

<h3>Shipping Locations</h3>
<p>We currently ship across India. International shipping is available for select countries. Please contact us for international shipping inquiries.</p>

<h3>Order Tracking</h3>
<p>Once your order ships, you will receive a confirmation email with a tracking number. You can track your order status through our website.</p>

<h3>Shipping Issues</h3>
<p>If your order is delayed or lost in transit, please contact us at support@fairyfrills.com and we will resolve the issue promptly.</p>`,
      is_active: true,
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      content: `<h2>Terms & Conditions</h2>
<p>Welcome to Fairy Frills. By accessing and using our website, you agree to be bound by these Terms and Conditions.</p>

<h3>Use of Website</h3>
<p>You may use our website for lawful purposes only. You agree not to use the site in any way that could damage, disable, or impair the website.</p>

<h3>Products & Pricing</h3>
<p>All products are subject to availability. Prices are listed in Indian Rupees (INR) and are subject to change without notice. We reserve the right to correct any pricing errors.</p>

<h3>Orders & Payment</h3>
<p>By placing an order, you agree to provide accurate and complete information. We accept major credit cards, debit cards, UPI, and net banking.</p>

<h3>Returns & Exchanges</h3>
<p>We accept returns within 7 days of delivery for unused items in original packaging. Custom or personalized items are non-returnable. Refunds are processed within 5-7 business days.</p>

<h3>Intellectual Property</h3>
<p>All content on this website, including designs, logos, images, and text, is the property of Fairy Frills and is protected by intellectual property laws.</p>

<h3>Limitation of Liability</h3>
<p>Fairy Frills shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</p>

<h3>Contact</h3>
<p>For questions about these Terms, please contact us at support@fairyfrills.com.</p>`,
      is_active: true,
    },
  ])
}

async function seedSiteSettings(container: any, logger: any) {
  const service = container.resolve("siteSettings")
  const existing = await service.listSiteSettings({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding site settings...")
  await service.createSiteSettings({
    confetti_enabled: true,
  })
}

async function seedClientDiaries(container: any, logger: any) {
  const service = container.resolve("clientDiary")
  const existing = await service.listClientDiaries({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding client diaries...")
  await service.createClientDiaries([
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/800x800%20(2)-01KJQ0PAGYA6T0YS2XZ1XY1AR8.png",
      title: "Little Princess Aaradhya",
      caption: "Birthday celebration outfit",
      sort_order: 0,
      is_active: true,
    },
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/800x800%20(3)-01KJQ0RM7XP8SKXZCZ9EE6N52Z.jpg",
      title: "Mommy & Me Magic",
      caption: "Matching outfits for mother and daughter",
      sort_order: 1,
      is_active: true,
    },
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/800x800%20(7)-01KJQ0V6WTTW12ZS46A7898D3D.jpg",
      title: "Birthday Sparkle",
      caption: "Turning one in style!",
      sort_order: 2,
      is_active: true,
    },
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/BIRTHDAY-01KJQ0V6WTFXC1QA06XQH1HZJP.jpg",
      title: "Fairy Tale Birthday",
      caption: "Every girl deserves a fairy tale",
      sort_order: 3,
      is_active: true,
    },
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/800x800%20(1)-01KJQ2EB9F2VC6M7P7ZV6J9MP9.jpg",
      title: "Twinning Goals",
      caption: "Mother daughter combo love",
      sort_order: 4,
      is_active: true,
    },
  ])
}

async function seedClientFeedback(container: any, logger: any) {
  const service = container.resolve("clientFeedback")
  const existing = await service.listClientFeedbacks({})
  if (existing.length > 0) return

  logger.info("[seed-data] Seeding client feedback...")
  await service.createClientFeedbacks([
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/800x800%20(2)-01KJQ0PAGYA6T0YS2XZ1XY1AR8.png",
      customer_name: "Priya Sharma",
      platform: "whatsapp",
      caption: "Loved the birthday outfit! My daughter looked like a princess.",
      sort_order: 0,
      is_active: true,
    },
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/800x800%20(3)-01KJQ0RM7XP8SKXZCZ9EE6N52Z.jpg",
      customer_name: "Neha Gupta",
      platform: "instagram",
      caption: "Amazing quality and fast delivery. Will order again!",
      sort_order: 1,
      is_active: true,
    },
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/800x800%20(7)-01KJQ0V6WTTW12ZS46A7898D3D.jpg",
      customer_name: "Ananya Reddy",
      platform: "whatsapp",
      caption: "The mother-daughter combo was perfect for our photoshoot!",
      sort_order: 2,
      is_active: true,
    },
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/BIRTHDAY-01KJQ0V6WTFXC1QA06XQH1HZJP.jpg",
      customer_name: "Meera Patel",
      platform: "instagram",
      caption: "Such beautiful designs! Everyone asked where I got the dress.",
      sort_order: 3,
      is_active: true,
    },
    {
      image_url:
        "https://pub-3c5b484a6aa44db5a7f9e9baf52331b7.r2.dev/800x800%20(1)-01KJQ2EB9F2VC6M7P7ZV6J9MP9.jpg",
      customer_name: "Kavita Joshi",
      platform: "whatsapp",
      caption: "Best kids clothing brand! The fabric quality is amazing.",
      sort_order: 4,
      is_active: true,
    },
  ])
}
