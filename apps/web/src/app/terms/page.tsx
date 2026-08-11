export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl min-h-[60vh]">
      <header className="mb-12 border-b-2 border-primary pb-4">
        <h1 className="text-4xl font-extrabold uppercase text-primary">
          {isEn ? 'Terms of Service' : 'सेवाका सर्तहरु'}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {isEn ? 'Last updated: August 2026' : 'अन्तिम अद्यावधिक: अगस्ट २०८३'}
        </p>
      </header>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <p>
          {isEn 
            ? 'By accessing and using NepTechNews, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.' 
            : 'नेपटेकन्युज पहुँच गरेर र प्रयोग गरेर, तपाइँ यस सम्झौताका सर्तहरू र प्रावधानहरू स्वीकार गर्नुहुन्छ। थप रूपमा, यी विशेष सेवाहरू प्रयोग गर्दा, तपाइँ त्यस्ता सेवाहरूमा लागू हुने कुनै पनि पोस्ट गरिएका दिशानिर्देशहरू वा नियमहरूको अधीनमा हुनुहुनेछ।'}
        </p>

        <h3 className="text-2xl font-bold mt-8 mb-4">{isEn ? '1. Content and Copyright' : '१. सामग्री र प्रतिलिपि अधिकार'}</h3>
        <p>
          {isEn 
            ? 'All content published on NepTechNews, including articles, images, graphics, and videos, is the property of NepTech Media Group Pvt. Ltd. unless otherwise stated. Unauthorized reproduction or distribution is strictly prohibited.' 
            : 'नेपटेकन्युजमा प्रकाशित सबै सामग्रीहरू, लेख, छविहरू, ग्राफिक्स, र भिडियोहरू सहित, नेपटेक मिडिया ग्रुप प्रा. लि. को सम्पत्ति हो, अन्यथा उल्लेख नगरेसम्म। अनाधिकृत प्रजनन वा वितरण कडा रूपमा निषेधित छ।'}
        </p>

        <h3 className="text-2xl font-bold mt-8 mb-4">{isEn ? '2. User Comments and Behavior' : '२. प्रयोगकर्ता टिप्पणी र व्यवहार'}</h3>
        <p>
          {isEn 
            ? 'We encourage open dialogue, but we reserve the right to remove comments that are abusive, defamatory, or promote violence. Users who repeatedly violate these guidelines may be banned from interacting with the site.' 
            : 'हामी खुला संवादलाई प्रोत्साहन गर्छौं, तर अपमानजनक, मानहानिकारक, वा हिंसालाई बढावा दिने टिप्पणीहरू हटाउने अधिकार हामीसँग सुरक्षित छ। यी दिशानिर्देशहरू बारम्बार उल्लङ्घन गर्ने प्रयोगकर्ताहरूलाई साइटसँग अन्तर्क्रिया गर्न प्रतिबन्ध लगाउन सकिन्छ।'}
        </p>

        <h3 className="text-2xl font-bold mt-8 mb-4">{isEn ? '3. Modifications to Service' : '३. सेवामा परिमार्जनहरू'}</h3>
        <p>
          {isEn 
            ? 'NepTechNews reserves the right at any time to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice.' 
            : 'नेपटेकन्युजले कुनै पनि समयमा सूचना सहित वा बिना सेवा (वा यसको कुनै भाग) अस्थायी वा स्थायी रूपमा परिमार्जन वा बन्द गर्ने अधिकार सुरक्षित राख्छ।'}
        </p>
      </div>
    </div>
  );
}
