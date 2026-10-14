/**
 * E-TECH Intelligent Customer Support AI Assistant
 * Enterprise-grade conversational AI engine for E-TECH Digital Solutions
 * Supports: Real-time Groq LLM with fallback, High-accuracy NLP Intent Recognition,
 * Multi-turn memory, Quick Suggestion Chips, Rich formatting & Direct WhatsApp routing.
 */

(function () {
    'use strict';

    // Core Knowledge & Configuration
    const ETECH_INFO = {
        name: 'E-TECH Digital Solutions',
        nameAr: 'إي تيك للحلول الرقمية وتطوير البرمجيات',
        founder: 'المهندس عمر زايد (Eng. Omar Zayed)',
        whatsapp: '+201148296986',
        whatsappLink: 'https://wa.me/201148296986',
        phone: '+20 11 48296986',
        email: 'etechn3l3gy@gmail.com',
        prices: {
            starter: '3,900 ج.م',
            pro: '8,900 ج.م',
            enterprise: 'تسعير مخصص حسب متطلبات المشروع'
        }
    };

    // Chat History for multi-turn context
    const conversationHistory = [];

    // Helper: Normalize Arabic Text for fuzzy NLP matching
    function normalizeArabic(text) {
        if (!text) return '';
        let norm = text.trim().toLowerCase();
        // Remove diacritics / tashkeel
        norm = norm.replace(/[\u064B-\u065F\u0670]/g, '');
        // Unify Alef
        norm = norm.replace(/[أإآ]/g, 'ا');
        // Unify Taa Marbuta
        norm = norm.replace(/ة/g, 'ه');
        // Unify Yaa / Alef Maqsura
        norm = norm.replace(/ى/g, 'ي');
        // Strip punctuation & extra whitespace
        norm = norm.replace(/[.,/#!$%^&*;:{}=\-_`~()؟?]/g, ' ');
        norm = norm.replace(/\s+/g, ' ');
        return norm.trim();
    }

    // Helper: Format message markdown into safe HTML
    function formatMessageHtml(rawText) {
        if (!rawText) return '';
        let escaped = rawText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Bold **text**
        escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // Links [text](url)
        escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');

        // Convert raw URLs
        escaped = escaped.replace(/(https?:\/\/[^\s<]+)/g, function(url) {
            if (url.includes('class="chat-link"')) return url;
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
        });

        // Bullet points
        escaped = escaped.replace(/(?:^|\n)[•\-*]\s*(.+)/g, '<br>• $1');

        // Line breaks
        escaped = escaped.replace(/\n/g, '<br>');

        return escaped;
    }

    // Comprehensive Intent Engine
    function resolveLocalIntent(userInput) {
        const raw = (userInput || '').trim();
        const norm = normalizeArabic(raw);
        const isEn = !/[\u0600-\u06FF]/.test(raw) && /[a-zA-Z]/.test(raw);

        // 1. Frustration / Complaints / Criticisms ("غبي", "مش فاهم", "رد سيء")
        if (/غبي|حمار|فاشل|مش فاهم|مش ده|مش دا|كلامك غلط|ما بتفهمش|رد وحش|سيء|زفت|متخلف|stupid|dumb|useless|idiot|wrong answer/.test(norm)) {
            if (isEn) {
                return "I truly apologize if my previous answer wasn't accurate or helpful! 🌹\n\nAs E-TECH's AI assistant, I want to ensure you receive top-tier technical guidance. Let me connect you directly with our senior technical consultant right now on WhatsApp:\n\n👉 **WhatsApp Direct:** [Chat on WhatsApp](https://wa.me/201148296986)\nWe will make sure your request is handled with utmost precision.";
            }
            return "أعتذر لحضرتك جداً على أي تقصير أو عدم دقة في الرد السابق! 🌹\n\nبصفتي المساعد الذكي لـ **E-TECH**، هدفي تقديم أدق معلومة وأفضل خدمة لك. يسعدني تصحيح الأمر فوراً، أو يمكنك **التواصل مباشرة مع المهندس الاستشاري وفريقنا البشري** عبر واتساب لمناقشة طلبك بكل تفاصيله واحترافية تامة:\n\n📱 **واتساب المباشر:** [+201148296986](https://wa.me/201148296986)\nنحن في خدمتك دائماً ونضمن لك أفضل تجربة!";
        }

        // 2. Greetings & Polite Openings
        if (/^(سلام|سلام عليكم|السلام عليكم|مرحبا|اهلا|اهلين|ازيك|ازي حضرتك|صباح الخير|مساء الخير|هاي|يا هلا|الو|مساء الورد|صباح الفل|hello|hi|hey|good morning|good evening)$/.test(norm) ||
            /^(السلام عليكم ورحمة الله|مرحبا بك|اهلا وسهلا|تحياتي)$/.test(norm) ||
            (/\b(سلام|مرحبا|اهلا|ازيك|صباح الخير|مساء الخير|hi|hello)\b/.test(norm) && norm.length < 25)) {
            if (isEn) {
                return "Hello and welcome to **E-TECH Digital Solutions**! 🌟\n\nI am your smart technical advisor. How can I help you today with your educational platform, mobile app, e-commerce store, or custom website?\n\nFeel free to ask about our plans, live demos, or project timelines!";
            }
            return "وعليكم السلام ورحمة الله وبركاته! أهلاً بحضرتك في **E-TECH** للحلول الرقمية وتطوير البرمجيات. 🌟\n\nأنا مستشارك التقني الذكي، ويسعدني الإجابة على كافة استفساراتك حول المنصات التعليمية، المتاجر الإلكترونية، تطبيقات الموبايل، والمواقع التعريفية.\n\nكيف يمكنني مساعدة مشروعك اليوم؟";
        }

        // 3. Identity / About E-TECH / Leadership / Founder
        if (/مين انت|من انتم|مين اصحاب|مين صاحب|مين المدير|مين المؤسس|عمر زايد|عن الشركه|نبذه عنكم|من تكون|اين انتم|مقركم|عنوانكم|شركتكم|who are you|about us|founder|omar zayed/.test(norm)) {
            if (isEn) {
                return "**E-TECH** is a premier software engineering and digital solutions agency led by **Eng. Omar Zayed**.\n\n✨ **What We Deliver:**\n• **Educational Platforms (LMS):** High-security DRM video streaming with dynamic watermarks.\n• **High-Converting E-Commerce:** Blazing speed, one-step checkout, and seamless payment integration.\n• **Mobile Apps (iOS & Android):** Built with modern Flutter & React Native architectures.\n• **Showcase & Corporate Websites:** Cyberpunk & modern UI/UX with top-tier SEO.\n\n📍 Based in Egypt, serving enterprises and clients across the entire Arab world and internationally.\n\nDirect WhatsApp: [+201148296986](https://wa.me/201148296986)";
            }
            return "**شركة E-TECH** هي وكالة برمجية رائدة متخصصة في تطوير أحدث الحلول الرقمية، وتطبيقات الويب والموبايل.\n\n🚀 **بقيادة المهندس عمر زايد (Eng. Omar Zayed)** وفريق من نخبة مهندسي البرمجيات وتجربة المستخدم.\n\n✨ **أبرز مجالات تخصصنا:**\n• **المنصات التعليمية (LMS):** أقوى حماية مشفرة ضد تصوير الشاشة مع علامات مائية وبنوك أسئلة.\n• **المتاجر الإلكترونية المتكاملة:** سريعة وسلسة مع ربط بوابات الدفع والشحن.\n• **تطبيقات الجوال (iOS & Android):** تطبيقات هجينة وأصلية بتجربة استخدام فائقة.\n• **المواقع التعريفية وصفحات الهبوط:** بتصاميم عصرية جذابة وتوافق تام مع محركات البحث.\n\n📍 مقرنا الرئيسي في مصر ونخدم مئات العملاء في مصر والوطن العربي. هل تود معرفة تفاصيل باقاتنا أو طلب استشارة خاصة؟";
        }

        // 4. Pricing, Costs, & Quotes
        if (/سعر|اسعار|اسعاركم|بكام|بكم|تكلف|تكلفه|فلوس|باقه|باقات|خطط|عروض|خصم|كام يكلف|price|cost|pricing|how much|plans|quote/.test(norm)) {
            if (isEn) {
                return "Our official transparent pricing plans at **E-TECH**:\n\n" +
                       "1️⃣ **Starter Plan** — From **3,900 EGP**:\n" +
                       "• Best for showcase websites, landing pages, and startups.\n" +
                       "• Ultra-fast responsive design + smart contact forms.\n\n" +
                       "2️⃣ **Pro Platform Plan** — **8,900 EGP** (Most Popular ⭐):\n" +
                       "• Complete Educational LMS Platform or full-fledged E-Commerce store.\n" +
                       "• Screen recording protection, dynamic watermarks, online exams, & payment gateways.\n\n" +
                       "3️⃣ **Enterprise & Mobile Apps** — **Custom Quote**:\n" +
                       "• Dedicated cross-platform mobile apps (iOS & Android) and cloud systems.\n\n" +
                       "🎁 **Included Free with All Plans:**\n" +
                       "✓ Free Domain + High-speed cloud hosting for 1 year.\n" +
                       "✓ 3 months free dedicated maintenance & support.\n\n" +
                       "Would you like a custom breakdown for your project idea? Chat directly on WhatsApp: [+201148296986](https://wa.me/201148296986)";
            }
            return "خطط الأسعار الرسمية في **E-TECH** واضحة ومدروسة لتقديم أقصى قيمة لاستثمارك: 💼\n\n" +
                   "1️⃣ **باقة الانطلاق (Starter)** — تبدأ من **3,900 ج.م**:\n" +
                   "• مثالية للمواقع التعريفية وصفحات الهبوط والشركات الناشئة.\n" +
                   "• تصميم عصري وسريع، متوافق 100% مع الجوال مع نموذج تواصل ذكي.\n\n" +
                   "2️⃣ **باقة المنصات المتقدمة (Pro)** — **8,900 ج.م** (الأكثر طلباً ⭐):\n" +
                   "• منصة تعليمية متكاملة (LMS) أو متجر إلكتروني احترافي.\n" +
                   "• تشمل حماية الفيديوهات من التسجيل، علامة مائية ديناميكية، بوابات دفع، واختبارات إلكترونية.\n\n" +
                   "3️⃣ **الباقة المؤسسية (Enterprise)** — **تسعير مخصص**:\n" +
                   "• لتطبيقات الموبايل المزدوجة (iOS & Android) والأنظمة السحابية المعقدة.\n\n" +
                   "🎁 **هدايا مجانية مع كل باقة:**\n" +
                   "✓ دومين واستضافة سحابية فائقة السرعة مجاناً لسنة كاملة.\n" +
                   "✓ صيانة ودعم فني مخصص مجاناً لمدة 3 أشهر.\n\n" +
                   "هل تحب تفاصيل محددة لمشروعك؟ يمكنك مراسلتنا فوراً على واتساب: [+201148296986](https://wa.me/201148296986)";
        }

        // 5. Educational Platforms (LMS) & Teachers
        if (/منص|تعليم|مدرس|معلم|سنتر|اكاديمي|كورس|كورسات|امتحان|طالب|طلاب|تسجيل الشاشه|علامه مائيه|فيديو|فيديوهات|lms|education|course|teacher|school/.test(norm)) {
            if (isEn) {
                return "E-TECH is an industry leader in **Educational Platforms (LMS)**:\n\n" +
                       "🔒 **Maximum Content Security:** Full screen-recording prevention with dynamic floating student watermarks (name & phone number).\n" +
                       "📝 **Online Examination Engine:** Automated grading, question banks, and student performance analytics.\n" +
                       "💳 **Automated Payment Gateways:** Vodafone Cash, Fawry, InstaPay, Visa & Meeza for automatic course unlock.\n" +
                       "📊 **Comprehensive Admin Panel:** Powerful dashboards for teachers and teaching assistants to manage subscriptions and homework.\n\n" +
                       "Starting at **8,900 EGP** inclusive of hosting & domain!\n" +
                       "👉 Contact us on WhatsApp for a **Live Demo**: [+201148296986](https://wa.me/201148296986)";
            }
            return "تعتبر المنصات التعليمية **(LMS)** من أقوى تخصصاتنا في **E-TECH**، وتخدم آلاف الطلاب يومياً بأعلى درجات الاستقرار: 🎓\n\n" +
                   "🔒 **أعلى حماية للمحتوى:** منع تسجيل الشاشة تماماً مع علامة مائية ديناميكية تحمل اسم ورقم هاتف الطالب تتحرك عشوائياً لمنع أي تسريب.\n" +
                   "📝 **نظام اختبارات متكامل:** بنوك أسئلة، تصحيح إلكتروني فوري، وإحصائيات تفصيلية لمستوى كل طالب.\n" +
                   "💳 **بوابات دفع فورية:** فودافون كاش، إنستاباي، فوري، فيزا وميزة لتفعيل الحصص والأكواد تلقائياً.\n" +
                   "📊 **لوحة تحكم إدارية:** للمدرس ومساعديه لإدارة الطلاب، الحصص، بنك الأسئلة، والواجبات.\n\n" +
                   "💡 تبدأ باقة المنصة التعليمية الكاملة من **8,900 ج.م** فقط شاملة الاستضافة والدومين والدعم!\n" +
                   "هل ترغب في تجربة **ديمو حي (Live Demo)** للمنصة الآن؟ تواصل معنا مباشرة عبر واتساب: [+201148296986](https://wa.me/201148296986)";
        }

        // 6. E-Commerce & Online Stores
        if (/متجر|متاجر|سله|شحن|منتج|منتجات|بيع|شراء|دفع الكتروني|كوبون|ecommerce|store|shop|cart|payment/.test(norm)) {
            if (isEn) {
                return "We craft high-converting, blazing-fast **E-Commerce Stores** equipped with:\n\n" +
                       "⚡ **1-Step Checkout:** Mobile-first user experience designed for maximum conversion rates.\n" +
                       "💳 **Integrated Payment & Shipping:** Credit cards, mobile wallets, and automated shipping calculators.\n" +
                       "📦 **Complete Arabic Admin Dashboard:** Real-time stock control, order processing, and discount coupons.\n" +
                       "🎯 **Ad Pixel Integration:** Full integration with Meta Pixel, TikTok, and Google Analytics for maximum ROAS.\n\n" +
                       "Starting from **8,900 EGP** inclusive of 1 year hosting & domain!\n" +
                       "Tell us what products you plan to sell, or message us on WhatsApp: [+201148296986](https://wa.me/201148296986)";
            }
            return "نقدم في **E-TECH** حلول المتاجر الإلكترونية المتكاملة المصممة لمضاعفة مبيعاتك: 🛒\n\n" +
                   "⚡ **سرعة فائقة وسلة شراء سريعة:** تجربة شراء سلسة بخطوة واحدة (1-Step Checkout) لرفع معدل التحويل والمبيعات.\n" +
                   "💳 **ربط بوابات الدفع والشحن:** دعم كامل للفيزا، ماستركارد، ميزة، المحافظ الإلكترونية، وربط شركات الشحن.\n" +
                   "📦 **لوحة تحكم كاملة بالعربية:** لإدارة المنتجات، المخزون، الطلبات، الكوبونات، وتقارير المبيعات التفصيلية.\n" +
                   "🎯 **تكامل مع البكسلات الإعلانية:** ربط Meta Pixel و TikTok و Google Analytics لتحقيق أعلى عائد إعلاني.\n\n" +
                   "تبدأ باقات المتاجر من **8,900 ج.م** شاملة استضافة ودومين ودعم مجاني لسنة كاملة!\n" +
                   "ما نوع المنتجات التي تود بيعها؟ يسعدنا مساعدتك في اختيار أفضل هيكلة لمتجرك عبر واتساب: [+201148296986](https://wa.me/201148296986)";
        }

        // 7. Mobile Applications (iOS & Android)
        if (/تطبيق|ابلكيشن|موبايل|اندرويد|ايفون|جوال|فلاتر|flutter|react native|ios|android|mobile app|application/.test(norm)) {
            if (isEn) {
                return "We build enterprise-grade **Mobile Applications (iOS & Android)** using Flutter & React Native:\n\n" +
                       "🎨 **Stunning UI/UX:** Compliant with Apple Human Interface & Google Material design standards.\n" +
                       "🔔 **Push Notifications:** Instant engagement alerts to retain and convert active users.\n" +
                       "⚡ **High-Performance Architecture:** Smooth 60fps animations with minimal battery consumption.\n" +
                       "🚀 **Store Publishing:** Complete handling of Google Play & Apple App Store review and publishing.\n\n" +
                       "Let's discuss your mobile app vision on WhatsApp: [+201148296986](https://wa.me/201148296986)";
            }
            return "نطور في **E-TECH** تطبيقات هواتف ذكية متطورة بنظامي **(iOS & Android)** باستخدام أحدث التقنيات العالمية (Flutter & React Native): 📱\n\n" +
                   "🎨 **واجهات مستخدم مذهلة (UI/UX):** تصاميم عصرية وسلسة جداً تتوافق مع أحدث إرشادات Apple و Google.\n" +
                   "🔔 **إشعارات لحظية (Push Notifications):** لإعادة تنشيط المستخدمين وزيادة التفاعل والطلبات.\n" +
                   "⚡ **أداء خفيف وفائق السرعة:** استهلاك ذكي للبيانات والبطارية مع استقرار تام.\n" +
                   "🚀 **نشر كامل على المتاجر:** نقوم بإعداد ورفع التطبيق ومتابعة اعتماده على Google Play و App Store بالكامل.\n\n" +
                   "ما هي فكرة تطبيقك؟ شاركنا التفاصيل وسنزودك بدراسة فنية مبدئية مجاناً عبر واتساب: [+201148296986](https://wa.me/201148296986)";
        }

        // 8. Websites & Landing Pages
        if (/موقع|ويب|ويب سايت|لاندنج|صفحه هبوط|تعريفي|تصميم موقع|برمجه موقع|website|landing page|web/.test(norm)) {
            if (isEn) {
                return "We engineer state-of-the-art **Websites & Landing Pages**:\n\n" +
                       "💎 **Exclusive Modern UI/UX:** Cyberpunk and sleek aesthetic that builds instant trust.\n" +
                       "🚀 **Lightning-Fast Speed:** Fully optimized for search engine rankings (SEO).\n" +
                       "📱 **100% Mobile Responsive:** Flawless experience on all screen sizes.\n" +
                       "🔒 **Enterprise Security:** Free SSL certificate, DDoS protection, and cloud hosting.\n\n" +
                       "Starting from **3,900 EGP** inclusive of free domain & hosting!\n" +
                       "Contact us to build your website today: [+201148296986](https://wa.me/201148296986)";
            }
            return "نصمم ونبرمج مواقع إلكترونية عصرية وصفحات هبوط تعكس فخامة واحترافية علامتك التجارية: 🌐\n\n" +
                   "💎 **تصميم فريد وسايبربانك فاخر:** يبهر زوارك من النظرة الأولى ويعزز ثقة عملائك.\n" +
                   "🚀 **سرعة تحميل خارقة:** محسّنة بنسبة 100% لمحركات البحث (SEO) لتصدر نتائج البحث في Google.\n" +
                   "📱 **تجاوب كامل:** أداء متطابق وسلس على الهواتف والأجهزة اللوحية وأجهزة الكمبيوتر.\n" +
                   "🔒 **أمان متكامل:** شهادة حماية SSL مشفرة، واستضافة سحابية سريعة ومحمية.\n\n" +
                   "تبدأ باقة المواقع من **3,900 ج.م** فقط شاملة الدومين والاستضافة لسنة مجاناً!\n" +
                   "هل تحب رؤية نماذج سابقة أو طلب موقعك الآن؟ تواصل معنا عبر واتساب: [+201148296986](https://wa.me/201148296986)";
        }

        // 9. Duration & Delivery Time
        if (/وقت|مده|كم يوم|كام يوم|تستغرق|تخلص|تسليم|تاريخ|تنفيذ|timeline|duration|how long|delivery/.test(norm)) {
            if (isEn) {
                return "We adhere strictly to guaranteed delivery milestones at **E-TECH**:\n\n" +
                       "• **Showcase Websites & Landing Pages:** 3 to 5 business days.\n" +
                       "• **Educational LMS & E-Commerce Stores:** 10 to 14 business days (including testing & data entry).\n" +
                       "• **Mobile Applications & Custom Systems:** 3 to 5 weeks based on scope.\n\n" +
                       "⚡ **Express Delivery** is also available for urgent launches.\n" +
                       "Let's discuss your deadline on WhatsApp: [+201148296986](https://wa.me/201148296986)";
            }
            return "نلتزم في **E-TECH** بمواعيد تسليم دقيقة وواضحة نضمنها في اتفاق العمل: ⏱️\n\n" +
                   "• **المواقع التعريفية وصفحات الهبوط:** من **3 إلى 5 أيام عمل**.\n" +
                   "• **المنصات التعليمية والمتاجر الإلكترونية:** من **10 إلى 14 يوم عمل** شاملة الاختبار وإدخال البيانات.\n" +
                   "• **تطبيقات الموبايل والأنظمة المخصصة:** من **3 إلى 5 أسابيع** حسب حجم الميزات.\n\n" +
                   "⚡ نوفر أيضاً مسار **التنفيذ السريع (Express Delivery)** للمشاريع ذات الأولوية الطارئة.\n" +
                   "هل لديك موعد محدد تود إطلاق مشروعك فيه؟ راسلنا عبر واتساب: [+201148296986](https://wa.me/201148296986)";
        }

        // 10. Payment Methods & Terms
        if (/دفع|طرق الدفع|فودافون كاش|انستاباي|فيزا|ميزه|تقسيط|عربون|تحويل|payment|instapay|vodafone/.test(norm)) {
            if (isEn) {
                return "We provide flexible, secure payment methods:\n\n" +
                       "• **InstaPay:** Instant bank transfers.\n" +
                       "• **Mobile Wallets:** Vodafone Cash, Orange, Etisalat & WE Pay.\n" +
                       "• **Cards:** Visa, Mastercard, & Meeza.\n" +
                       "• **Official Bank Transfers:** For registered companies.\n\n" +
                       "💼 Standard payment terms: 50% deposit to commence work, and 50% upon final review and approval before live deployment.";
            }
            return "نوفر في **E-TECH** خيارات دفع مريحة وآمنة لعملائنا في مصر وخارجها: 💳\n\n" +
                   "• **إنستاباي (InstaPay):** تحويل لحظي مباشر.\n" +
                   "• **المحافظ الإلكترونية:** فودافون كاش، أورنج كاش، إي آند كاش، ووي باي.\n" +
                   "• **البطاقات البنكية:** فيزا، ماستركارد، وميزة.\n" +
                   "• **تحويل بنكي رسمي:** متاح لحسابات الشركات والمؤسسات.\n\n" +
                   "💼 **نظام السداد:** 50% مقدم تعاقد وبدء تنفيذ، والـ 50% المتبقية بعد معاينتك واعتمادك الكامل للنسخة التجريبية قبل الإطلاق الرسمي!";
        }

        // 11. Guarantees, Maintenance, & Support
        if (/ضمان|دعم|صيانه|مشاكل|عطل|تعديل|تحديث|خدمه ما بعد|support|guarantee|maintenance/.test(norm)) {
            if (isEn) {
                return "Your project's long-term success is our priority:\n\n" +
                       "✓ **3 Months Free Maintenance:** Full technical support and adjustments included free.\n" +
                       "✓ **99.9% Uptime Guarantee:** High-availability cloud servers.\n" +
                       "✓ **Video Training:** Step-by-step video tutorials on managing your admin panel.\n" +
                       "✓ **24/7 Emergency Support:** Dedicated technical team always on standby.";
            }
            return "في **E-TECH**، نجاح مشروعك واستمراره هو أولويتنا القصوى: 🛡️\n\n" +
                   "✓ **3 أشهر صيانة ودعم فني مجاني كامل:** لمعالجة أي ملاحظات أو تحديثات دورية.\n" +
                   "✓ **ضمان استقرار 99.9%:** لسيرفرات الاستضافة وقواعد البيانات.\n" +
                   "✓ **تدريب شامل بالفيديو:** نشرح لك ولوحة تحكمك خطوة بخطوة كيف تدير كل شيء بنفسك.\n" +
                   "✓ **فريق طوارئ فني:** متواجد على مدار الساعة لحل أي ظرف طارئ فوراً.\n\n" +
                   "نحن شركاؤك التقنيون في كل خطوة!";
        }

        // 12. Contact, Phone, & WhatsApp
        if (/تواصل|رقم|واتس|واتساب|تلفون|تليفون|هاتف|ايميل|بريد|عنوان|مكانكم|اكلم حد|مبيعات|اتصل|contact|phone|whatsapp|email|call/.test(norm)) {
            if (isEn) {
                return "Reach out directly to our leadership and engineering team:\n\n" +
                       "📱 **Direct WhatsApp:** [+201148296986](https://wa.me/201148296986)\n" +
                       "📞 **Phone:** +20 11 48296986\n" +
                       "✉️ **Email:** etechn3l3gy@gmail.com\n\n" +
                       "We are available 24/7 to answer your questions and quote your project!";
            }
            return "يسعدنا تواصلك المباشر مع فريق الإدارة والاستشارات التقنية في أي وقت: 📞\n\n" +
                   "🟢 **واتساب المباشر (الأسرع والأسهل):** [+20 11 48296986](https://wa.me/201148296986)\n" +
                   "📱 **اتصال هاتفي:** +20 11 48296986\n" +
                   "✉️ **البريد الإلكتروني:** etechn3l3gy@gmail.com\n" +
                   "📍 **المقر:** مصر (ونخدم عملاءنا في كافة أنحاء العالم العربي)\n\n" +
                   "اضغط على رابط الواتساب لبدء محادثة فورية مع المهندس الاستشاري الآن!";
        }

        // 13. Portfolio & Previous Work
        if (/اعمال|سابقه|نماذج|بورتفوليو|شغلكم|مشاريع|ديمو|portfolio|samples|projects|work/.test(norm)) {
            if (isEn) {
                return "We take pride in powering high-profile educational centers, e-commerce stores, and corporate websites across the region.\n\n" +
                       "• You can explore our interactive work directly on our **[Portfolio Page](pages/portfolio.html)**.\n" +
                       "• Live interactive demos for our LMS and Stores are ready to test immediately!\n\n" +
                       "👉 Message us on WhatsApp for live demo credentials: [+201148296986](https://wa.me/201148296986)";
            }
            return "نفخر في **E-TECH** بتنفيذ عشرات المشاريع الناجحة لكبرى السناتر التعليمية والمتاجر والشركات: 🏆\n\n" +
                   "• يمكنك تصفح نماذج أعمالنا ومشاريعنا التفاعلية مباشرة من صفحة **[معرض الأعمال (Portfolio)](pages/portfolio.html)**.\n" +
                   "• نوفر روابط تجريبية حية (Live Demos) لتجربة المنصة كطالب أو كمعلم، وتجربة المتجر الإلكتروني بنفسك.\n\n" +
                   "تواصل معنا عبر واتساب وسنرسل لك روابط الديمو فوراً: [+201148296986](https://wa.me/201148296986)";
        }

        // 14. Technology Stack & Security
        if (/تقني|لغات|stack|technology|tech|react|node|python|flutter|database|سيرفر|حمايه|امان/.test(norm)) {
            if (isEn) {
                return "At **E-TECH**, we leverage state-of-the-art enterprise stacks:\n\n" +
                       "• **Frontend:** React.js, Next.js, Modern CSS3, TypeScript.\n" +
                       "• **Backend:** Node.js, Python FastAPI, high-concurrency microservices.\n" +
                       "• **Databases:** PostgreSQL, Redis cache, MongoDB.\n" +
                       "• **Mobile:** Flutter & React Native.\n" +
                       "• **Security:** Cloudflare DDoS mitigation, DRM video encryption, and automated backups.";
            }
            return "نعتمد في **E-TECH** على أحدث وأقوى البنى البرمجية العالمية لضمان الأمان والسرعة الفائقة: 🛡️\n\n" +
                   "• **الواجهات الأمامية:** React.js, Next.js, TypeScript, Modern CSS3.\n" +
                   "• **الأنظمة الخلفية (Backend):** Node.js, Python FastAPI, بنية Microservices.\n" +
                   "• **قواعد البيانات:** PostgreSQL, Redis Cache, MongoDB.\n" +
                   "• **تطبيقات الجوال:** Flutter, React Native.\n" +
                   "• **الحماية والاستضافة:** سيرفرات سحابية سريعة مع حماية Cloudflare وتشفير فيديوهات متقدم.";
        }

        // 15. Compliments & Gratitude
        if (/شكرا|تسلم|ممتاز|عاش|الله يخليك|يعطيك العافيه|مشكور|تمام|ماشي|اوكي|عظيم|thanks|thx|great|perfect|awesome/.test(norm)) {
            if (isEn) {
                return "You are very welcome! 🌟 It is our utmost pleasure at **E-TECH** to serve you. Whenever you are ready to launch your project, we are always here for you on WhatsApp: [+201148296986](https://wa.me/201148296986). Have a wonderful day!";
            }
            return "الشكر لله وحده يا فندم! 🌟 نحن في **E-TECH** سعداء جداً بخدمتك وفي انتظارك دائماً. إذا رغبت في أي استشارة إضافية أو بدء تنفيذ مشروعك، يسعدنا تواصلك معنا في أي وقت عبر واتساب: [+201148296986](https://wa.me/201148296986). يومك سعيد وموفق بإذن الله! 🚀";
        }

        // 16. Context-Aware Fallback (Polite, structured, never repeats robotic "سعداء باستفسارك حول: ...")
        if (isEn) {
            return "Thank you for reaching out to **E-TECH Digital Solutions**! 💡\n\n" +
                   "We specialize in:\n" +
                   "• **Educational LMS Platforms** with anti-recording video protection.\n" +
                   "• **High-converting E-Commerce** stores with payment & shipping integrations.\n" +
                   "• **Native & Cross-platform Mobile Apps** (iOS & Android).\n" +
                   "• **Modern Showcase Websites** with high-speed performance.\n\n" +
                   "To give you the most accurate technical recommendation and quotation, please chat with our senior consultant on WhatsApp: [+201148296986](https://wa.me/201148296986) or choose from the quick topics below!";
        }
        return "أهلاً بحضرتك! استفسارك محط اهتمامنا الكبير في **E-TECH**. 💡\n\n" +
               "نحن متخصصون في تصميم وتطوير الحلول البرمجية المتكاملة:\n" +
               "• **المنصات التعليمية المتقدمة (LMS)** مع حماية الفيديوهات من التسجيل وبنوك الأسئلة.\n" +
               "• **المتاجر الإلكترونية السريعة** مع ربط بوابات الدفع والشحن.\n" +
               "• **تطبيقات الموبايل الذكية** (iOS & Android) بأحدث التقنيات.\n" +
               "• **المواقع التعريفية وصفحات الهبوط** بتصاميم استثنائية وسرعة فائقة.\n\n" +
               "لضمان إعطائك أفضل إجابة فنية دقيقة وعرض سعر ملائم لاحتياجاتك، يسعدنا مناقشة تفاصيل فكرتك مباشرة مع المهندس الاستشاري عبر **واتساب المباشر**: [+201148296986](https://wa.me/201148296986) أو يمكنك اختيار أحد المواضيع السريعة أدناه!";
    }

    // Live AI query with Groq LLM integration and seamless fallback
    async function getAIResponse(userInput) {
        const siteSettings = (typeof DataManager !== 'undefined' && DataManager.getData && DataManager.getData().siteSettings) || {};
        const groqApiKey = siteSettings.groqApiKey || '';

        // Add user turn to conversation history
        conversationHistory.push({ role: 'user', content: userInput });
        if (conversationHistory.length > 8) conversationHistory.shift();

        // 1. If Groq API Key is configured in Admin Settings, use live LLM with strict professional prompt
        if (groqApiKey) {
            const savedModel = siteSettings.groqModel || 'llama-3.3-70b-versatile';
            const candidateModels = [savedModel, 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
            const uniqueModels = [...new Set(candidateModels)];

            const systemPrompt = `أنت المستشار التقني ومسؤول نجاح العملاء الرسمي لشركة E-TECH للبرمجيات والحلول الرقمية (E-TECH Digital Solutions) بقيادة المهندس عمر زايد.
مهمتك:
1. الرد بأسلوب فائق اللباقة والاحترافية والود، باللهجة المصرية الراقية المهذبة (أو بالإنجليزية إذا سأل العميل بالإنجليزية).
2. معلومات الشركة الأساسية:
- الباقات: باقة الانطلاق للمواقع التعريفية (تبدأ من 3900 ج.م)، باقة المنصات التعليمية LMS والمتاجر الإلكترونية (8900 ج.م الأكثر طلباً)، والباقة المؤسسية وتطبيقات الموبايل المخصصة (تسعير مخصص).
- كافة الباقات تشمل دومين واستضافة سريعة مجاناً لسنة و3 أشهر صيانة ودعم فني مجاناً.
- المنصات التعليمية تشمل حماية كاملة للفيديوهات من تصوير الشاشة مع علامة مائية متحركة باسم ورقم الطالب، وبنوك أسئلة وتصحيح آلي وبوابات دفع.
- المتاجر تشمل سلة سريعة وربط بوابات الدفع (فيزا، فودافون كاش، إنستاباي، فوري) والشحن وبكسلات الإعلانات.
- تطبيقات الموبايل تطور بأحدث تقنيات Flutter و React Native لكلا النظامين iOS و Android.
- التواصل المباشر عبر واتساب: +201148296986 أو البريد: etechn3l3gy@gmail.com.
3. كن موجزاً وواضحاً ومقنعاً، واختم دائماً بتشجيع العميل على التواصل عبر واتساب +201148296986 للحصول على عرض سعر أو ديمو حي.`;

            const messagesPayload = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.slice(-6)
            ];

            for (const model of uniqueModels) {
                try {
                    const controller = new AbortController();
                    const timer = setTimeout(() => controller.abort(), 4500);

                    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + groqApiKey
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: messagesPayload,
                            temperature: 0.6,
                            max_tokens: 650
                        }),
                        signal: controller.signal
                    });
                    clearTimeout(timer);

                    if (res.ok) {
                        const data = await res.json();
                        if (data.choices && data.choices[0] && data.choices[0].message) {
                            const reply = data.choices[0].message.content.trim();
                            conversationHistory.push({ role: 'assistant', content: reply });
                            return reply;
                        }
                    }
                } catch (err) {
                    console.warn(`Groq model ${model} skipped:`, err);
                }
            }
        }

        // 2. High-Accuracy Built-in NLU Engine
        const localReply = resolveLocalIntent(userInput);
        conversationHistory.push({ role: 'assistant', content: localReply });
        return localReply;
    }

    // Quick Suggestion Chips Configuration
    const QUICK_CHIPS = [
        { label: '💰 خطط الأسعار', query: 'عايز اعرف اسعار الباقات عندكم' },
        { label: '🎓 المنصات التعليمية', query: 'تفاصيل المنصة التعليمية وحماية الفيديوهات' },
        { label: '🛒 المتاجر الإلكترونية', query: 'تفاصيل المتاجر الالكترونية وبوابات الدفع' },
        { label: '📱 تطبيقات الموبايل', query: 'تطوير تطبيقات الجوال ايفون واندرويد' },
        { label: '⏱️ مدة التسليم', query: 'كم تستغرق مدة تنفيذ المشروع؟' },
        { label: '💬 تحدث عبر واتساب', link: 'https://wa.me/201148296986' }
    ];

    // Initialize Widget on Current Page
    function initSupportWidget() {
        const liveChatToggle = document.getElementById('liveChatToggle');
        const chatWidget = document.getElementById('chatWidget');
        const chatCloseBtn = document.getElementById('chatCloseBtn');
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');

        if (!liveChatToggle || !chatWidget || !chatMessages || !chatInput || !chatSendBtn) {
            return;
        }

        // Ensure Quick Chips Bar Exists
        let chipsContainer = chatWidget.querySelector('.chat-quick-chips');
        if (!chipsContainer) {
            chipsContainer = document.createElement('div');
            chipsContainer.className = 'chat-quick-chips';
            chipsContainer.innerHTML = QUICK_CHIPS.map(chip => {
                if (chip.link) {
                    return `<a href="${chip.link}" target="_blank" rel="noopener noreferrer" class="chat-chip chip-link">${chip.label}</a>`;
                }
                return `<button type="button" class="chat-chip" data-query="${chip.query}">${chip.label}</button>`;
            }).join('');

            // Insert above input bar
            const inputBar = chatWidget.querySelector('.chat-input-bar');
            if (inputBar) {
                chatWidget.insertBefore(chipsContainer, inputBar);
            }
        }

        // Delegate Chip Clicks
        chipsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-query]');
            if (btn) {
                const query = btn.getAttribute('data-query');
                chatInput.value = query;
                handleUserSend();
            }
        });

        // Toggle Open / Close
        function toggleChat() {
            const isOpen = chatWidget.classList.contains('active') || chatWidget.classList.contains('open');
            if (isOpen) {
                chatWidget.classList.remove('active', 'open');
            } else {
                chatWidget.classList.add('active', 'open');
                setTimeout(() => chatInput.focus(), 150);
            }
        }

        liveChatToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleChat();
        });

        if (chatCloseBtn) {
            chatCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                chatWidget.classList.remove('active', 'open');
            });
        }

        // Handle Sending Message
        let isSending = false;
        async function handleUserSend() {
            const rawText = chatInput.value.trim();
            if (!rawText || isSending) return;

            isSending = true;

            // Render User Bubble
            const userBubble = document.createElement('div');
            userBubble.className = 'msg-bubble user';
            userBubble.textContent = rawText;
            chatMessages.appendChild(userBubble);
            chatInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Sync with DataManager if available
            if (typeof DataManager !== 'undefined' && DataManager.addMessage) {
                DataManager.addMessage({
                    name: 'زائر المحادثة الفورية',
                    email: 'chat-visitor@etech.com',
                    text: rawText,
                    message: rawText,
                    from: 'user'
                });
            }

            // Render Bot Typing Bubble
            const botBubble = document.createElement('div');
            botBubble.className = 'msg-bubble bot';
            botBubble.innerHTML = '<span class="chat-typing-dots"><i class="fa-solid fa-spinner fa-spin"></i> جاري إعداد الرد باحترافية...</span>';
            chatMessages.appendChild(botBubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const replyText = await getAIResponse(rawText);
                botBubble.innerHTML = formatMessageHtml(replyText);

                if (typeof DataManager !== 'undefined' && DataManager.addMessage) {
                    DataManager.addMessage({
                        text: replyText,
                        message: replyText,
                        from: 'bot'
                    });
                }
            } catch (err) {
                console.error('Chat error:', err);
                const fallbackText = resolveLocalIntent(rawText);
                botBubble.innerHTML = formatMessageHtml(fallbackText);
            } finally {
                isSending = false;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }

        chatSendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleUserSend();
        });

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleUserSend();
            }
        });

        // Ensure styles for chips and links
        injectStyles();
    }

    // Inject essential styling for chips and markdown links
    function injectStyles() {
        if (document.getElementById('etech-ai-styles')) return;
        const style = document.createElement('style');
        style.id = 'etech-ai-styles';
        style.textContent = `
            .chat-widget-box.open,
            .chat-widget-box.active {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(0) !important;
                display: flex !important;
            }
            .chat-quick-chips {
                display: flex;
                gap: 0.4rem;
                padding: 0.5rem 0.75rem;
                overflow-x: auto;
                background: rgba(0, 0, 0, 0.25);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                scrollbar-width: none;
            }
            .chat-quick-chips::-webkit-scrollbar {
                display: none;
            }
            .chat-chip {
                background: rgba(184, 240, 34, 0.08);
                color: #b8f022;
                border: 1px solid rgba(184, 240, 34, 0.25);
                padding: 0.3rem 0.65rem;
                border-radius: 9999px;
                font-size: 0.74rem;
                font-weight: 600;
                white-space: nowrap;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                font-family: inherit;
            }
            .chat-chip:hover {
                background: #b8f022;
                color: #0d1117;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(184, 240, 34, 0.25);
            }
            .chat-chip.chip-link {
                background: rgba(34, 197, 94, 0.15);
                color: #4ade80;
                border-color: rgba(34, 197, 94, 0.35);
            }
            .chat-chip.chip-link:hover {
                background: #22c55e;
                color: #ffffff;
            }
            .chat-link {
                color: #b8f022 !important;
                font-weight: 700;
                text-decoration: underline;
                display: inline-block;
                padding: 0 2px;
            }
            .chat-link:hover {
                color: #d9f99d !important;
            }
            .chat-typing-dots {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                color: var(--primary, #b8f022);
                font-size: 0.8rem;
                opacity: 0.9;
            }
            .msg-bubble.bot {
                background: rgba(184, 240, 34, 0.08) !important;
                border: 1px solid rgba(184, 240, 34, 0.2) !important;
                color: #f1f5f9 !important;
                line-height: 1.6 !important;
            }
            .msg-bubble strong {
                color: #b8f022;
            }
        `;
        document.head.appendChild(style);
    }

    // Auto-boot when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSupportWidget);
    } else {
        initSupportWidget();
    }

    // Expose API globally for integration
    window.EtechAIAssistant = {
        getAIResponse: getAIResponse,
        resolveLocalIntent: resolveLocalIntent
    };
})();
