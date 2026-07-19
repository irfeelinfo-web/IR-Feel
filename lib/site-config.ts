// Central source of truth for all editable site content.
// The admin panel edits these structures and stores them in the DB.
// These defaults mirror the original hardcoded site content and are used
// as a fallback when the DB has no value yet.

export type SiteSettings = {
  brandName: string
  brandAccent: string // the accented character shown after the brand name (e.g. ".")
  logoImage: string // optional logo image; when empty the text brand is shown
  faviconImage?: string // optional favicon image
  phone: string
  email: string
  address: string
  currencySymbol: string
  freeShippingThreshold: number
  metaTitle: string
  metaDescription: string
  socials: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
  }
  productWhatsappButton: boolean
  productCallButton: boolean
  whatsappNumber?: string
  accountPromo: {
    enabled: boolean
    title: string
    text: string
    buttonText: string
    buttonHref: string
  }
}

export type AnnouncementConfig = {
  enabled: boolean
  text: string
  highlight: string
  code?: string
  showTrackOrder: boolean
  showHelp: boolean
}

export type NavItem = { label: string; href: string; key: string }

export type HeaderConfig = {
  nav: NavItem[]
}

export type FooterLink = { label: string; href: string }
export type FooterColumn = { title: string; links: FooterLink[] }

export type FooterConfig = {
  newsletterTitle: string
  newsletterText: string
  columns: FooterColumn[]
  copyright: string
  paymentBadges: string[]
}

export type HeroSlide = {
  label: string
  titleLine1: string
  titleLine2: string
  accent: string
  subtitle: string
  image: string
  alt: string
  buttonText: string
  buttonHref: string
}

export type CategoryItem = { name: string; image: string; href: string; enabled?: boolean }

export type PromoBanner = {
  kind: "solid" | "image"
  title: string
  subtitle: string
  highlight: string
  note: string
  image: string
  buttonText: string
  buttonHref: string
  dark: boolean
}

export type FeatureItem = { icon: string; title: string; desc: string }

export type ReviewItem = {
  name: string
  role: string
  rating: number
  text: string
  initials: string
}

export type HomeConfig = {
  heroSlides: HeroSlide[]
  featuredHeading: string
  featuredSubheading: string
  categoriesHeading: string
  categories: CategoryItem[]
  newArrivalsHeading: string
  newArrivalsSubheading: string
  promoBanners: PromoBanner[]
  features: FeatureItem[]
  reviewsHeading: string
  reviewsRatingText: string
  reviews: ReviewItem[]
}

export type FaqItem = { q: string; a: string }
export type StoreLocation = { name: string; address: string; phone: string; hours: string }

export type PagesConfig = {
  faqTitle: string
  faqIntro: string
  faq: FaqItem[]
  shippingTitle: string
  shippingBody: string
  returnsTitle: string
  returnsBody: string
  contactTitle: string
  contactIntro: string
  contactPhone: string
  contactEmail: string
  contactAddress: string
  contactHours: string
  contactWhatsapp?: string
  stores: StoreLocation[]
  trackOrderTitle?: string
  trackOrderIntro?: string
}

export type PaymentConfig = {
  bkashNumber: string
  nagadNumber: string
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  bankBranch: string
  bankRoutingNumber: string
  // Delivery charges
  insideDhakaCharge: number
  outsideDhakaCharge: number
  codEnabled: boolean
  supportPhone?: string
}

export const defaultPayment: PaymentConfig = {
  bkashNumber: "01700-000000",
  nagadNumber: "01700-000000",
  bankName: "The City Bank PLC",
  bankAccountName: "IR Feel Enterprise",
  bankAccountNumber: "1203456789001",
  bankBranch: "Gulshan Branch, Dhaka",
  bankRoutingNumber: "225261234",
  insideDhakaCharge: 60,
  outsideDhakaCharge: 120,
  codEnabled: true,
  supportPhone: "+880 1700-000000",
}

export const defaultSettings: SiteSettings = {
  brandName: "IR Feel",
  brandAccent: ".",
  logoImage: "",
  faviconImage: "",
  phone: "",
  email: "",
  address: "Dhaka, Bangladesh",
  currencySymbol: "৳",
  freeShippingThreshold: 999,
  metaTitle: "IR Feel — Premium Fashion & Streetwear",
  metaDescription:
    "Trendy premium fashion from IR Feel that elevates your everyday style. Shop hoodies, jackets, denim and accessories with free shipping on orders over ৳ 999 across Bangladesh.",
  socials: {
    facebook: "#",
    instagram: "#",
    twitter: "#",
    youtube: "#",
  },
  productWhatsappButton: true,
  productCallButton: true,
  whatsappNumber: "",
  accountPromo: {
    enabled: true,
    title: "বিশেষ অফার!",
    text: "আপনার পরবর্তী অর্ডারে ১০% ছাড় পান। এখনই শপিং করুন।",
    buttonText: "শপ করুন",
    buttonHref: "/shop",
  },
}

export const defaultAnnouncement: AnnouncementConfig = {
  enabled: true,
  text: "Free Shipping on orders over",
  highlight: "৳ 999",
  showTrackOrder: true,
  showHelp: true,
}

export const defaultHeader: HeaderConfig = {
  nav: [
    { label: "HOME", href: "/", key: "home" },
    { label: "SHOP", href: "/shop", key: "shop" },
    { label: "COLLECTION", href: "/collections", key: "collection" },
    { label: "MEN", href: "/category/men", key: "men" },
    { label: "WOMEN", href: "/category/women", key: "women" },
    { label: "CONTACT", href: "/contact", key: "contact" },
  ],
}

export const defaultFooter: FooterConfig = {
  newsletterTitle: "STAY IN THE LOOP",
  newsletterText: "Subscribe to get updates on new arrivals, exclusive offers and more.",
  columns: [
    {
      title: "SHOP",
      links: [
        { label: "Men", href: "/category/men" },
        { label: "Women", href: "/category/women" },
        { label: "Kids", href: "/category/kids" },
        { label: "Accessories", href: "/category/accessories" },
        { label: "All Collections", href: "/collections" },
      ],
    },
    {
      title: "COMPANY",
      links: [
        { label: "Our Stores", href: "/our-stores" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "HELP",
      links: [
        { label: "Shipping & Delivery", href: "/shipping-delivery" },
        { label: "Returns & Exchanges", href: "/returns-exchanges" },
        { label: "Size Guide", href: "/size-guide" },
        { label: "FAQ", href: "/faq" },
        { label: "Track Order", href: "/track-order" },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} IR Feel. All Rights Reserved.`,
  paymentBadges: ["VISA", "MC", "AMEX", "Pay"],
}

export const defaultHome: HomeConfig = {
  heroSlides: [
    {
      label: "LIMITED DROP",
      titleLine1: "OWN THE",
      titleLine2: "PERFECT ",
      accent: "MOMENT",
      subtitle: "Exclusive pieces available for a limited time only.",
      image: "/images/hero-model.png",
      alt: "Model wearing an all-black hoodie and joggers from the limited drop",
      buttonText: "SHOP NOW",
      buttonHref: "/shop",
    },
    {
      label: "NEW ARRIVALS",
      titleLine1: "EFFORTLESS",
      titleLine2: "EVERYDAY ",
      accent: "LUXE",
      subtitle: "Soft neutral knits and tailored fits for a refined wardrobe.",
      image: "/images/hero-model-2.png",
      alt: "Model wearing a beige oversized knit sweater and tailored trousers",
      buttonText: "SHOP NOW",
      buttonHref: "/shop",
    },
    {
      label: "STREET EDIT",
      titleLine1: "DEFINE",
      titleLine2: "YOUR OWN ",
      accent: "LANE",
      subtitle: "Denim staples and street-ready layers built to stand out.",
      image: "/images/hero-model-3.png",
      alt: "Model wearing a premium denim jacket with a white tee and black jeans",
      buttonText: "SHOP NOW",
      buttonHref: "/shop",
    },
  ],
  featuredHeading: "FEATURED PRODUCTS",
  featuredSubheading: "Handpicked essentials our customers love most.",
  categoriesHeading: "SHOP BY CATEGORY",
  categories: [
    { name: "MEN", image: "/images/category-men.png", href: "/category/men" },
    { name: "WOMEN", image: "/images/category-women.png", href: "/category/women" },
    { name: "KIDS", image: "/images/category-kids.png", href: "/category/kids" },
    { name: "ACCESSORIES", image: "/images/category-accessories.png", href: "/category/accessories" },
  ],
  newArrivalsHeading: "NEW ARRIVALS",
  newArrivalsSubheading: "Fresh drops added to the lineup.",
  promoBanners: [
    {
      kind: "image",
      title: "FLASH SALE",
      highlight: "UP TO 50% OFF",
      subtitle: "",
      note: "LIMITED TIME OFFER",
      image: "/images/banner-flash-sale.png",
      buttonText: "SHOP NOW",
      buttonHref: "/shop",
      dark: false,
    },
    {
      kind: "image",
      title: "NEW ARRIVALS",
      highlight: "",
      subtitle: "CHECK OUT THE LATEST TRENDS",
      note: "",
      image: "/images/banner-new-arrivals.png",
      buttonText: "SHOP NOW",
      buttonHref: "/shop",
      dark: false,
    },
    {
      kind: "image",
      title: "BEST SELLERS",
      highlight: "",
      subtitle: "SHOP OUR MOST POPULAR STYLES",
      note: "",
      image: "/images/banner-best-sellers.png",
      buttonText: "SHOP NOW",
      buttonHref: "/shop",
      dark: true,
    },
  ],
  features: [
    { icon: "Truck", title: "FREE SHIPPING", desc: "On orders over ৳ 999" },
    { icon: "RotateCcw", title: "EASY RETURNS", desc: "7 days return policy" },
    { icon: "ShieldCheck", title: "SECURE PAYMENT", desc: "100% secure checkout" },
    { icon: "Headphones", title: "24/7 SUPPORT", desc: "Dedicated support" },
  ],
  reviewsHeading: "WHAT OUR CUSTOMERS SAY",
  reviewsRatingText: "4.9/5 from 2,400+ happy customers",
  reviews: [
    {
      name: "Ayesha Rahman",
      role: "Verified Buyer",
      rating: 5,
      text: "Absolutely love the quality! The fabric feels premium and the fit is perfect. Delivery was faster than expected.",
      initials: "AR",
    },
    {
      name: "Tanvir Ahmed",
      role: "Verified Buyer",
      rating: 5,
      text: "Best fashion store I've ordered from. The bomber jacket exceeded my expectations. Highly recommended!",
      initials: "TA",
    },
    {
      name: "Sadia Islam",
      role: "Verified Buyer",
      rating: 4,
      text: "Great collection and reasonable prices. The packaging was elegant and everything arrived in perfect condition.",
      initials: "SI",
    },
    {
      name: "Rafiul Karim",
      role: "Verified Buyer",
      rating: 5,
      text: "Stylish, comfortable, and durable. I've reordered three times now. Customer support is super responsive too.",
      initials: "RK",
    },
    {
      name: "Nusrat Jahan",
      role: "Verified Buyer",
      rating: 5,
      text: "The striped shirt is my new favorite. Exactly as pictured and the material breathes so well. Will buy again!",
      initials: "NJ",
    },
    {
      name: "Imran Hossain",
      role: "Verified Buyer",
      rating: 5,
      text: "Effortless shopping experience from start to finish. Premium feel at an affordable price. Five stars!",
      initials: "IH",
    },
  ],
}

export const defaultPages: PagesConfig = {
  faqTitle: "Frequently Asked Questions",
  faqIntro: "Everything you need to know about shopping with us.",
  faq: [
    { q: "কীভাবে অর্ডার করব?", a: "পছন্দের পণ্য নির্বাচন করে সাইজ ও পরিমাণ বেছে নিন, তারপর 'ORDER NOW' বাটনে ক্লিক করে চেকআউট ফর্ম পূরণ করুন। কনফার্মেশনের পর আমরা আপনার অর্ডার প্রসেস করব।" },
    { q: "পেমেন্টের কী কী মাধ্যম আছে?", a: "আমরা ক্যাশ অন ডেলিভারি, bKash, Nagad, Rocket এবং কার্ড পেমেন্ট গ্রহণ করি। পণ্য হাতে পেয়েও মূল্য পরিশোধ করতে পারবেন।" },
    { q: "ডেলিভারিতে কত সময় লাগে?", a: "ঢাকার ভেতরে ১-২ কর্মদিবস এবং ঢাকার বাইরে ৩-৫ কর্মদিবসের মধ্যে পণ্য পৌঁছে যায়।" },
    { q: "সাইজ ঠিক না হলে কী করব?", a: "পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে এক্সচেঞ্জের জন্য অনুরোধ করতে পারবেন। পণ্যটি অব্যবহৃত ও মূল ট্যাগসহ থাকতে হবে।" },
    { q: "অর্ডার ট্র্যাক করব কীভাবে?", a: "অর্ডার কনফার্ম হওয়ার পর আপনি SMS-এ আপডেট পাবেন। এছাডা আমাদের সাপোর্ট নাম্বারে যোগাযোগ করে অর্ডারের অবস্থা জানতে পারবেন।" },
    { q: "অর্ডার বাতিল করা যাবে কি?", a: "পণ্য ডেলিভারির জন্য পাঠানোর আগ পর্যন্ত অর্ডার বাতিল করা যাবে। এজন্য দ্রুত আমাদের সাথে যোগাযোগ করুন।" },
  ],
  shippingTitle: "Shipping & Delivery",
  shippingBody:
    "We offer free shipping on all orders over ৳ 999. Standard delivery takes 2-5 business days depending on your location. Inside Dhaka orders are usually delivered within 1-2 days.",
  returnsTitle: "Returns & Exchanges",
  returnsBody:
    "We accept returns and exchanges within 7 days of delivery. Items must be unworn, unwashed and in their original packaging with tags attached.",
  contactTitle: "Get in Touch",
  contactIntro: "Have a question? We'd love to hear from you.",
  contactPhone: "",
  contactEmail: "",
  contactAddress: "",
  contactHours: "",
  contactWhatsapp: "",
  stores: [
    {
      name: "IR Feel Flagship — Gulshan",
      address: "Road 11, Gulshan 1, Dhaka 1212",
      phone: "+880 1700-000001",
      hours: "10:00 AM - 9:00 PM",
    },
    {
      name: "IR Feel Outlet — Dhanmondi",
      address: "Road 27, Dhanmondi, Dhaka 1209",
      phone: "+880 1700-000002",
      hours: "10:00 AM - 9:00 PM",
    },
  ],
  trackOrderTitle: "Track Order",
  trackOrderIntro: "Enter your Order ID and Phone Number to check the current status of your shipment.",
}

/** Deep-merge stored partial data over defaults so new fields always resolve. */
export function mergeDefaults<T>(defaults: T, stored: unknown): T {
  if (stored === null || stored === undefined) return defaults
  if (Array.isArray(defaults)) {
    if (!Array.isArray(stored)) return defaults
    if (defaults.length > 0) {
      const template = defaults[0]
      if (typeof template === "object" && template !== null) {
        // Merge each stored item with the template, and append any missing default items
        const merged = stored.map((item) => mergeDefaults(template, item))
        // If defaults has more items than stored, fill in the missing ones
        for (let i = stored.length; i < defaults.length; i++) {
          merged.push(defaults[i])
        }
        return merged as T
      }
    }
    return stored as T
  }
  if (typeof defaults === "object" && typeof stored === "object") {
    const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) }
    for (const key of Object.keys(defaults as Record<string, unknown>)) {
      out[key] = mergeDefaults((defaults as Record<string, unknown>)[key], (stored as Record<string, unknown>)[key])
    }
    return out as T
  }
  return (stored as T) ?? defaults
}
