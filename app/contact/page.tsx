import { Phone, Mail, MapPin, Clock, MessageCircle, Headset, Sparkles } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ContactForm } from "@/components/contact/contact-form"
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from "@/components/brand-icons"
import { buildMetadata } from "@/lib/seo"
import { getPages, getSettings } from "@/lib/content"


export async function generateMetadata() {
  return await buildMetadata({
    title: "Contact Us — IR Feel",
    description:
      "Get in touch with IR Feel for any question, order support or feedback. Call, email or send us a message. যোগাযোগ করুন ফোন, ইমেইল বা বার্তায়।",
    path: "/contact",
  })
}

export default async function ContactPage() {
  const [pages, settings] = await Promise.all([getPages(), getSettings()])

  const contactCards = [
    {
      icon: Phone,
      title: "Call Us",
      lines: [pages.contactPhone || settings.phone || "+880 1700-000000"],
      hint: "সকাল ৯টা - রাত ৯টা",
    },
    {
      icon: Mail,
      title: "Email Us",
      lines: [pages.contactEmail || settings.email || "support@fashion.com"],
      hint: "২৪ ঘণ্টার মধ্যে উত্তর",
    },
    {
      icon: MapPin,
      title: "Visit Our Store",
      lines: [pages.contactAddress || "১২৩ ফ্যাশন এভিনিউ, গুলশান-২, ঢাকা-১২১২"],
      hint: "শোরুম সরাসরি ভিজিট করুন",
    },
    {
      icon: Clock,
      title: "Business Hours",
      lines: [pages.contactHours || "শনি - বৃহস্পতি: ৯টা - ৯টা"],
      hint: "সাপোর্ট সবসময় সক্রিয়",
    },
  ]

  const socials = [
    { Icon: FacebookIcon, label: "Facebook", href: settings.socials.facebook },
    { Icon: InstagramIcon, label: "Instagram", href: settings.socials.instagram },
    { Icon: TwitterIcon, label: "Twitter", href: settings.socials.twitter },
    { Icon: YoutubeIcon, label: "YouTube", href: settings.socials.youtube },
  ].filter((s) => s.href && s.href !== "#")

  const cleanPhone = (pages.contactPhone || settings.phone || "+880 1700-000000").replace(/[^0-9+]/g, "")
  const whatsappNumber = (pages.contactWhatsapp || settings.whatsappNumber || settings.phone || "+880 1700-000000").replace(/[^0-9]/g, "")

  return (
    <>
      <SiteHeader active="contact" />
      <main className="relative min-h-screen overflow-hidden bg-background">
        {/* ── Background Grid & Blobs for Glassmorphism depth ── */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,#000_80%,transparent_100%)] pointer-events-none z-0" />
        
        <div className="contact-blob" style={{ width: 450, height: 450, background: "rgba(212, 175, 55, 0.25)", top: "-10%", left: "5%", animationDelay: "0s" }} />
        <div className="contact-blob" style={{ width: 400, height: 400, background: "rgba(168, 130, 255, 0.18)", top: "25%", right: "5%", animationDelay: "4s" }} />
        <div className="contact-blob" style={{ width: 350, height: 350, background: "rgba(56, 189, 248, 0.15)", bottom: "30%", left: "10%", animationDelay: "8s" }} />
        <div className="contact-blob" style={{ width: 380, height: 380, background: "rgba(244, 63, 94, 0.12)", bottom: "5%", right: "12%", animationDelay: "12s" }} />

        {/* ── Hero ── */}
        <section className="relative border-b border-border z-10">
          <div className="relative mx-auto max-w-[1280px] px-4 py-16 text-center sm:px-6 sm:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-gold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Support
            </span>
            <h1 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-5xl">
              {pages.contactTitle || "Get in Touch"}
            </h1>
            <p className="font-bengali mx-auto mt-5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {pages.contactIntro || "অর্ডার, পণ্য বা যেকোনো জিজ্ঞাসায় আমরা সাহায্য করতে প্রস্তুত। নিচের যেকোনো মাধ্যমে যোগাযোগ করুন—আমরা দ্রুততম সময়ে সাড়া দেব।"}
            </p>
          </div>
        </section>

        {/* ── Contact info glass cards ── */}
        <section className="relative z-10">
          <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {contactCards.map((card) => (
                <div
                  key={card.title}
                  className="glass-contact-card flex flex-col gap-3 p-6"
                >
                  <span className="glass-icon-circle flex h-12 w-12 items-center justify-center">
                    <card.icon className="h-5 w-5 text-gold" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-base font-bold text-foreground">{card.title}</h3>
                  <div className="flex flex-col gap-0.5">
                    {card.lines.map((line) => (
                      <p key={line} className="text-sm text-muted-foreground">
                        {line}
                      </p>
                    ))}
                  </div>
                  <p className="font-bengali mt-1 text-xs font-medium text-gold">{card.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Form + side panel ── */}
        <section className="relative z-10">
          <div className="mx-auto max-w-[1280px] px-4 pb-16 sm:px-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
              <ContactForm />

              <aside className="flex flex-col gap-6">
                {/* Quick support */}
                <div className="glass-sidebar-panel font-bengali flex flex-col gap-4 p-6">
                  <div className="flex items-center gap-2">
                    <span className="glass-icon-circle flex h-9 w-9 items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-gold" strokeWidth={1.8} />
                    </span>
                    <h3 className="text-base font-bold text-foreground">Quick Support</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    জরুরি সহায়তার জন্য সরাসরি হোয়াটসঅ্যাপে বা ফোনে কল করুন। আমাদের টিম আপনার
                    অর্ডার ও পণ্য সম্পর্কিত সকল প্রশ্নের উত্তর দিতে প্রস্তুত।
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.03] hover:bg-gold hover:text-primary-foreground shadow-md hover:shadow-gold/10"
                    >
                      <Phone className="h-4 w-4" strokeWidth={2} />
                      কল করুন
                    </a>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:bg-[#20ba5a] shadow-md hover:shadow-[#25D366]/20"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* Social */}
                {socials.length > 0 && (
                  <div className="glass-sidebar-panel font-bengali flex flex-col gap-4 p-6">
                    <h3 className="text-base font-bold text-foreground">Follow Us</h3>
                    <p className="text-sm text-muted-foreground">
                      নতুন কালেকশন ও অফার সবার আগে জানতে আমাদের সাথে যুক্ত থাকুন।
                    </p>
                    <div className="flex gap-3">
                      {socials.map(({ Icon, label, href }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={label}
                          className="glass-social-btn flex h-11 w-11 items-center justify-center text-foreground"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map */}
                <div className="glass-map-wrap">
                  <iframe
                    title="আমাদের অবস্থান"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(pages.contactAddress || "Gulshan 2, Dhaka")}&output=embed&z=15`}
                    className="h-56 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
