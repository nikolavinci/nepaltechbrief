import { Card, CardContent } from "@/components/ui/card";

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  const team = [
    { roleEn: 'Chairman / Publisher', roleNp: 'अध्यक्ष / प्रकाशक', name: 'Birendra Sharma', img: '11' },
    { roleEn: 'Editor-in-Chief', roleNp: 'प्रधान सम्पादक', name: 'Sita Acharya', img: '44' },
    { roleEn: 'Managing Editor', roleNp: 'प्रबन्ध सम्पादक', name: 'Ramesh Karki', img: '33' },
    { roleEn: 'Senior Tech Correspondent', roleNp: 'वरिष्ठ प्रविधि संवाददाता', name: 'Anita Gurung', img: '22' },
    { roleEn: 'Business Analyst', roleNp: 'व्यापार विश्लेषक', name: 'Sunil Shrestha', img: '55' },
    { roleEn: 'Political Reporter', roleNp: 'राजनीतिक रिपोर्टर', name: 'Dipendra Thapa', img: '66' },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[60vh]">
      <header className="mb-12 border-b-2 border-primary pb-4 text-center">
        <h1 className="text-4xl font-extrabold uppercase text-primary">
          {isEn ? 'Our Editorial Team' : 'हाम्रो सम्पादकीय टोली'}
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          {isEn 
            ? 'Meet the dedicated journalists and tech experts behind NepTechNews who work tirelessly to bring you accurate and timely information.' 
            : 'नेपटेकन्युज पछाडिका समर्पित पत्रकार र प्रविधि विशेषज्ञहरूलाई भेट्नुहोस् जसले तपाईंलाई सही र समयसापेक्ष जानकारी ल्याउन अथक प्रयास गर्छन्।'}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {team.map((member, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow bg-card">
            <CardContent className="p-0 text-center flex flex-col items-center pt-8 pb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-muted">
                <img 
                  src={`https://i.pravatar.cc/150?img=${member.img}`} 
                  alt={member.name} 
                  className="object-cover w-full h-full"
                />
              </div>
              <h2 className="text-xl font-bold">{member.name}</h2>
              <p className="text-primary font-semibold uppercase text-sm mt-1 tracking-wider">
                {isEn ? member.roleEn : member.roleNp}
              </p>
              <div className="mt-4 flex gap-3 text-muted-foreground">
                {/* Social placeholders */}
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </span>
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
