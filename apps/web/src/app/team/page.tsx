import { Card, CardContent } from "@/components/ui/card";
import { fetchTeamMembers } from "@/lib/api";

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  // 1. Fetch from WordPress custom post type
  let team = await fetchTeamMembers();

  // 2. Fallback to hardcoded list if WordPress plugin is not installed yet or has 0 members
  if (!team || team.length === 0) {
    team = [
      { member_details: { role_en: 'Chairman / Publisher', role_np: 'अध्यक्ष / प्रकाशक', facebook: '', twitter: '', linkedin: '' }, title: { rendered: 'Birendra Sharma' }, fallback_img: '11' },
      { member_details: { role_en: 'Editor-in-Chief', role_np: 'प्रधान सम्पादक', facebook: '', twitter: '', linkedin: '' }, title: { rendered: 'Sita Acharya' }, fallback_img: '44' },
      { member_details: { role_en: 'Managing Editor', role_np: 'प्रबन्ध सम्पादक', facebook: '', twitter: '', linkedin: '' }, title: { rendered: 'Ramesh Karki' }, fallback_img: '33' },
      { member_details: { role_en: 'Senior Tech Correspondent', role_np: 'वरिष्ठ प्रविधि संवाददाता', facebook: '', twitter: '', linkedin: '' }, title: { rendered: 'Anita Gurung' }, fallback_img: '22' },
      { member_details: { role_en: 'Business Analyst', role_np: 'व्यापार विश्लेषक', facebook: '', twitter: '', linkedin: '' }, title: { rendered: 'Sunil Shrestha' }, fallback_img: '55' },
      { member_details: { role_en: 'Political Reporter', role_np: 'राजनीतिक रिपोर्टर', facebook: '', twitter: '', linkedin: '' }, title: { rendered: 'Dipendra Thapa' }, fallback_img: '66' },
    ];
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[60vh]">
      <header className="mb-12 border-b-2 border-primary pb-4 text-center">
        <h1 className="text-4xl font-extrabold uppercase text-primary">
          {isEn ? 'Our Editorial Team' : 'हाम्रो सम्पादकीय टोली'}
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          {isEn 
            ? 'Meet the dedicated journalists and tech experts behind NepTechBrief who work tirelessly to bring you accurate and timely information.' 
            : 'नेपटेकन्युज पछाडिका समर्पित पत्रकार र प्रविधि विशेषज्ञहरूलाई भेट्नुहोस् जसले तपाईंलाई सही र समयसापेक्ष जानकारी ल्याउन अथक प्रयास गर्छन्।'}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {team.map((member: any, i: number) => {
          const name = member.title?.rendered || 'Team Member';
          const details = member.member_details || {};
          const role = isEn ? (details.role_en || 'Editor') : (details.role_np || 'Editor');
          const imageUrl = details.image_url || (member.fallback_img ? `https://i.pravatar.cc/150?img=${member.fallback_img}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=64748b&bold=true&size=150`);
          
          return (
            <Card key={i} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow bg-card">
              <CardContent className="p-0 text-center flex flex-col items-center pt-8 pb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-muted">
                  <img 
                    src={imageUrl} 
                    alt={name} 
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-primary font-semibold uppercase text-sm mt-1 tracking-wider">
                  {role}
                </p>
                <div className="mt-4 flex gap-3 text-muted-foreground">
                  {details.facebook && (
                    <a href={details.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </a>
                  )}
                  {details.twitter && (
                    <a href={details.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                    </a>
                  )}
                  {details.linkedin && (
                    <a href={details.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-blue-800 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
