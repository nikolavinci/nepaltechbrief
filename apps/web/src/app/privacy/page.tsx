export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      <header className="mb-12 border-b-2 border-primary pb-4">
        <h1 className="text-4xl font-extrabold uppercase text-primary">
          {isEn ? 'Privacy Policy' : 'गोपनीयता नीति'}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {isEn ? 'Last updated: August 2026' : 'अन्तिम अद्यावधिक: अगस्ट २०८३'}
        </p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <p>
          {isEn 
            ? 'At NepTechNews, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.' 
            : 'नेपटेकन्युजमा, हामी तपाईंको गोपनीयतालाई गम्भीर रूपमा लिन्छौं। यो गोपनीयता नीतिले तपाईं हाम्रो वेबसाइट भ्रमण गर्दा हामी कसरी तपाईंको जानकारी सङ्कलन, प्रयोग, खुलासा, र सुरक्षित राख्छौं भनी वर्णन गर्दछ।'}
        </p>

        <h3 className="text-2xl font-bold mt-8 mb-4">{isEn ? 'Information We Collect' : 'हामीले सङ्कलन गर्ने जानकारी'}</h3>
        <p>
          {isEn 
            ? 'We may collect information about you in a variety of ways, including data you provide directly to us (such as when registering for an account or newsletter) and data collected automatically (such as cookies and tracking technologies).' 
            : 'हामी तपाईंको बारेमा विभिन्न तरिकामा जानकारी सङ्कलन गर्न सक्छौं, जसमा तपाईंले हामीलाई प्रत्यक्ष रूपमा प्रदान गर्नुभएको डेटा (जस्तै खाता वा न्यूजलेटरको लागि दर्ता गर्दा) र स्वचालित रूपमा सङ्कलन गरिएको डेटा (जस्तै कुकीहरू र ट्र्याकिङ प्रविधिहरू) समावेश छन्।'}
        </p>

        <h3 className="text-2xl font-bold mt-8 mb-4">{isEn ? 'How We Use Your Information' : 'हामी तपाईंको जानकारी कसरी प्रयोग गर्छौं'}</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>{isEn ? 'To deliver personalized content and news recommendations.' : 'व्यक्तिगत सामग्री र समाचार सिफारिसहरू डेलिभर गर्न।'}</li>
          <li>{isEn ? 'To send administrative information, such as updates to our terms and policies.' : 'प्रशासनिक जानकारी पठाउन, जस्तै हाम्रा सर्तहरू र नीतिहरूमा अद्यावधिकहरू।'}</li>
          <li>{isEn ? 'To display targeted advertising.' : 'लक्षित विज्ञापन प्रदर्शन गर्न।'}</li>
          <li>{isEn ? 'To compile anonymous statistical data and analysis for internal use.' : 'आन्तरिक प्रयोगको लागि अज्ञात तथ्याङ्कीय डेटा र विश्लेषण कम्पाइल गर्न।'}</li>
        </ul>

        <h3 className="text-2xl font-bold mt-8 mb-4">{isEn ? 'Contact Us' : 'सम्पर्क गर्नुहोस्'}</h3>
        <p>
          {isEn 
            ? 'If you have questions or comments about this Privacy Policy, please contact us at privacy@neptechnews.com.' 
            : 'यदि तपाइँसँग यस गोपनीयता नीतिको बारेमा प्रश्न वा टिप्पणीहरू छन् भने, कृपया हामीलाई privacy@neptechnews.com मा सम्पर्क गर्नुहोस्।'}
        </p>
      </div>
    </div>
  );
}
