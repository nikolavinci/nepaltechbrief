import { Card, CardContent } from "@/components/ui/card";

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[60vh]">
      <header className="mb-12 border-b-2 border-primary pb-4">
        <h1 className="text-4xl font-extrabold uppercase text-primary">
          {isEn ? 'Contact Us / Give Feedback' : 'सम्पर्क / प्रतिक्रिया'}
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          {isEn 
            ? 'We value your feedback. Reach out to us for news tips, advertising inquiries, or general questions.' 
            : 'हामी तपाईंको प्रतिक्रियाको कदर गर्छौं। समाचार सुझाव, विज्ञापन सोधपुछ, वा सामान्य प्रश्नहरूको लागि हामीलाई सम्पर्क गर्नुहोस्।'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{isEn ? 'Send us a message' : 'हामीलाई सन्देश पठाउनुहोस्'}</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{isEn ? 'Full Name' : 'पूरा नाम'}</label>
              <input type="text" className="w-full p-2 rounded border bg-background" placeholder={isEn ? 'John Doe' : 'राम बहादुर'} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isEn ? 'Email Address' : 'इमेल ठेगाना'}</label>
              <input type="email" className="w-full p-2 rounded border bg-background" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isEn ? 'Subject' : 'विषय'}</label>
              <select className="w-full p-2 rounded border bg-background">
                <option>{isEn ? 'General Inquiry' : 'सामान्य सोधपुछ'}</option>
                <option>{isEn ? 'News Tip' : 'समाचार सुझाव'}</option>
                <option>{isEn ? 'Advertising' : 'विज्ञापन'}</option>
                <option>{isEn ? 'Feedback/Complaint' : 'प्रतिक्रिया/गुनासो'}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{isEn ? 'Message' : 'सन्देश'}</label>
              <textarea className="w-full p-2 rounded border bg-background min-h-[150px]" placeholder={isEn ? 'Your message here...' : 'तपाईंको सन्देश यहाँ...'}></textarea>
            </div>
            <button type="button" className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors">
              {isEn ? 'Submit Message' : 'सन्देश पठाउनुहोस्'}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <Card className="border-0 shadow-sm bg-muted/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">{isEn ? 'Head Office' : 'प्रधान कार्यालय'}</h3>
              <address className="not-italic text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">NepTech Media Group Pvt. Ltd.</p>
                <p>{isEn ? 'Baneshwor, Kathmandu' : 'बानेश्वर, काठमाडौं'}</p>
                <p>{isEn ? 'Bagmati Province, Nepal' : 'बागमती प्रदेश, नेपाल'}</p>
                <p className="pt-2"><strong>{isEn ? 'Phone:' : 'फोन:'}</strong> +977-1-4123456</p>
                <p><strong>{isEn ? 'Email:' : 'इमेल:'}</strong> info@neptechnews.com</p>
              </address>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-muted/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">{isEn ? 'Advertising & Business' : 'विज्ञापन र व्यापार'}</h3>
              <p className="text-muted-foreground mb-2">
                {isEn 
                  ? 'For digital ad placements, sponsored content, and partnerships, please contact our business team.' 
                  : 'डिजिटल विज्ञापन प्लेसमेन्ट, प्रायोजित सामग्री, र साझेदारीको लागि, कृपया हाम्रो व्यापार टोलीलाई सम्पर्क गर्नुहोस्।'}
              </p>
              <p className="text-primary font-bold">ads@neptechnews.com</p>
              <p className="text-primary font-bold">+977-9801234567</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
