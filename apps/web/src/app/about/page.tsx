import Link from 'next/link';

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      <header className="mb-12 border-b-2 border-primary pb-4">
        <h1 className="text-4xl font-extrabold uppercase text-primary">
          {isEn ? 'About NepTechNews' : 'नेपटेकन्युजको बारेमा'}
        </h1>
      </header>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-xl font-medium leading-relaxed mb-8">
          {isEn 
            ? 'NepTechNews is Nepal’s premier digital news platform, dedicated to delivering high-quality, verified, and timely information to our readers across the globe. Our mission is to bridge the information gap through robust digital journalism.' 
            : 'नेपटेकन्युज नेपालको प्रमुख डिजिटल समाचार प्लेटफर्म हो, जसले विश्वभरका हाम्रा पाठकहरूलाई उच्च-गुणस्तर, प्रमाणित, र समयसापेक्ष जानकारी प्रदान गर्न समर्पित छ। हाम्रो मिशन बलियो डिजिटल पत्रकारिता मार्फत सूचनाको खाडललाई कम गर्नु हो।'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-muted p-6 rounded-lg border-l-4 border-primary">
            <h3 className="text-2xl font-bold mb-4">{isEn ? 'Our Vision' : 'हाम्रो दृष्टिकोण'}</h3>
            <p>
              {isEn 
                ? 'To be the most trusted and innovative news source in Nepal, leveraging technology to empower citizens with unbiased facts and deep analytical insights.'
                : 'नेपालमा सबैभन्दा भरपर्दो र नवीन समाचार स्रोत बन्न, प्रविधिको प्रयोग गर्दै नागरिकहरूलाई निष्पक्ष तथ्य र गहिरो विश्लेषणात्मक अन्तर्दृष्टि प्रदान गर्ने।'}
            </p>
          </div>
          <div className="bg-muted p-6 rounded-lg border-l-4 border-destructive">
            <h3 className="text-2xl font-bold mb-4">{isEn ? 'Our Core Values' : 'हाम्रा मुख्य मूल्य मान्यता'}</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>{isEn ? 'Integrity and Truth' : 'अखंडता र सत्य'}</li>
              <li>{isEn ? 'Unbiased Reporting' : 'निष्पक्ष रिपोर्टिङ'}</li>
              <li>{isEn ? 'Technological Innovation' : 'प्राविधिक नवीनता'}</li>
              <li>{isEn ? 'Public Accountability' : 'सार्वजनिक जवाफदेहिता'}</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">{isEn ? 'The Publisher' : 'प्रकाशक'}</h2>
        <p>
          {isEn 
            ? 'Published by NepTech Media Group Pvt. Ltd., headquartered in the heart of Kathmandu. We operate with a dedicated team of journalists, tech experts, and editors who work around the clock to bring you the news that matters.' 
            : 'नेपटेक मिडिया ग्रुप प्रा. लि. द्वारा प्रकाशित, जसको प्रधान कार्यालय काठमाडौंको मुटुमा रहेको छ। हामी पत्रकार, प्राविधिक विशेषज्ञ र सम्पादकहरूको समर्पित टोलीसँग काम गर्छौं जसले तपाईंलाई महत्त्वपूर्ण समाचारहरू ल्याउन चौबीसै घण्टा काम गर्छन्।'}
        </p>

        <div className="mt-12 flex gap-4">
          <Link href={`/${lang}/team`} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors">
            {isEn ? 'Meet Our Team' : 'हाम्रो टोलीलाई भेट्नुहोस्'}
          </Link>
          <Link href={`/${lang}/contact`} className="px-6 py-2 border border-primary text-primary font-bold rounded hover:bg-muted transition-colors">
            {isEn ? 'Contact Us' : 'हामीलाई सम्पर्क गर्नुहोस्'}
          </Link>
        </div>
      </div>
    </div>
  );
}
