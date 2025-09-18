// src/lib/site.ts
export const siteConfig = {
  name: "Your Brand",
  url: "https://skyagent.vercel.app",
  description: "AI that ships beautiful sites. Start from a stunning template and customize copy, colors, and sections in minutes.",

  nav: {
    links: [
      { id: "home", title: "Home", href: "#" },
      { id: "features", title: "Features", href: "#features" },
      { id: "pricing", title: "Pricing", href: "#pricing" },
      { id: "faq", title: "FAQ", href: "#faq" },
    ],
  },

  hero: {
    badgeIcon: "✨",
    badge: "Now live",
    title: "AI that ships beautiful sites",
    description: "Start from a stunning template and customize copy, colors, and sections in minutes.",
    cta: {
      primary: { text: "Get started", href: "#pricing" },
      secondary: { text: "See features", href: "#features" },
    },
  },

  companyShowcase: {
    title: "Trusted by leading companies",
    companyLogos: [
      { name: "Company 1", logo: "/logo1.png" },
      { name: "Company 2", logo: "/logo2.png" },
      { name: "Company 3", logo: "/logo3.png" },
    ],
  },

  quoteSection: {
    quote: "This platform has transformed how we build and deploy websites.",
    author: "John Doe",
    title: "CEO, Tech Company",
  },

  featureSection: {
    title: "Powerful Features",
    description: "Everything you need to build amazing websites",
    features: [
      {
        id: "feature1",
        title: "AI-Powered Design",
        description: "Generate beautiful designs with artificial intelligence",
        icon: "🎨",
      },
      {
        id: "feature2",
        title: "Fast Deployment",
        description: "Deploy your sites in seconds, not hours",
        icon: "⚡",
      },
    ],
  },

  testimonials: [
    {
      id: "testimonial1",
      name: "Jane Smith",
      role: "Designer",
      content: "Amazing platform for building websites quickly.",
      avatar: "/avatar1.jpg",
    },
    {
      id: "testimonial2",
      name: "Mike Johnson",
      role: "Developer",
      content: "The AI features are incredibly powerful.",
      avatar: "/avatar2.jpg",
    },
  ],

  faqSection: {
    title: "Frequently Asked Questions",
    description: "Get answers to common questions",
    faqs: [
      {
        id: "faq1",
        question: "How does the AI work?",
        answer: "Our AI analyzes your requirements and generates optimized code.",
      },
      {
        id: "faq2",
        question: "Is it suitable for beginners?",
        answer: "Yes, our platform is designed to be user-friendly for all skill levels.",
      },
    ],
  },

  ctaSection: {
    title: "Ready to get started?",
    description: "Join thousands of developers building amazing websites",
    backgroundImage: "/cta-bg.jpg",
    cta: {
      text: "Start building",
      href: "#pricing",
    },
  },

  pricing: {
    title: "Simple Pricing",
    description: "Choose the plan that works for you",
    plans: [
      {
        id: "free",
        name: "Free",
        price: "$0",
        features: ["Basic features", "Community support"],
        cta: { text: "Get started", href: "#" },
      },
      {
        id: "pro",
        name: "Pro",
        price: "$29",
        features: ["All features", "Priority support", "Advanced AI"],
        cta: { text: "Start trial", href: "#" },
      },
    ],
  },

  growthSection: {
    title: "Growing Fast",
    description: "Join our rapidly expanding community",
    stats: [
      { label: "Users", value: "10,000+" },
      { label: "Websites", value: "50,000+" },
      { label: "Countries", value: "100+" },
    ],
  },

  bentoSection: {
    title: "Everything you need",
    description: "Powerful features to build amazing websites",
    items: [
      {
        id: "bento1",
        title: "AI Design Assistant",
        description: "Generate beautiful designs with AI",
        content: "FirstBentoAnimation",
      },
      {
        id: "bento2",
        title: "Real-time Collaboration",
        description: "Work together with your team",
        content: "SecondBentoAnimation",
      },
      {
        id: "bento3",
        title: "Advanced Analytics",
        description: "Track your website performance",
        content: "ThirdBentoAnimation",
      },
      {
        id: "bento4",
        title: "Global CDN",
        description: "Fast loading worldwide",
        content: "FourthBentoAnimation",
      },
    ],
  },

  footerLinks: {
    product: [
      { title: "Features", href: "#features" },
      { title: "Pricing", href: "#pricing" },
    ],
    company: [
      { title: "About", href: "#about" },
      { title: "Contact", href: "#contact" },
    ],
  },

  links: {
    twitter: "https://twitter.com",
    github: "https://github.com/Khoseyy/Magic-UI-template-1-0",
  },
};

export type SiteConfig = typeof siteConfig;