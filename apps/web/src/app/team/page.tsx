import { Card, CardContent } from "@/components/ui/card";
import { fetchTeamMembers } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  let team = await fetchTeamMembers();

  if (!team || team.length === 0) {
    // Graceful fallback if API is down
    team = [];
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': team.map((member: any, index: number) => {
      const details = member.profile_details || {};
      const name = `${details.first_name || ''} ${details.last_name || ''}`.trim() || member.title?.rendered;
      return {
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Person',
          'name': name,
          'jobTitle': details.designation,
          'email': details.email || undefined,
          'description': details.short_bio || undefined,
          'image': details.profile_picture || undefined,
          'sameAs': [details.facebook, details.twitter, details.linkedin].filter(Boolean)
        }
      };
    })
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[60vh]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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

      {team.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          {isEn ? 'Team members are currently being updated.' : 'टोली सदस्यहरू हाल अद्यावधिक भइरहेका छन्।'}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {team.map((member: any, i: number) => {
          const details = member.profile_details || {};
          const name = member.first_name ? `${member.first_name} ${member.last_name}`.trim() : (`${details.first_name || ''} ${details.last_name || ''}`.trim() || member.title?.rendered || 'Team Member');
          const role = member.designation || details.designation || 'Editor';
          const pic = member.profile_picture || details.profile_picture;
          const imageUrl = pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=64748b&bold=true&size=150`;
          const bio = member.short_bio || details.short_bio;
          
          return (
            <Link href={`/team/${member.slug}`} key={i}>
            <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow bg-card h-full">
              <CardContent className="p-0 text-center flex flex-col items-center pt-8 pb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-muted relative">
                  <Image src={imageUrl} alt={name} fill className="object-cover" sizes="128px" />
                </div>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-primary font-semibold uppercase text-sm mt-1 tracking-wider">{role}</p>
                {bio && <p className="mt-3 text-sm text-muted-foreground px-6 line-clamp-3">{bio}</p>}
                
                <div className="mt-4 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">View Profile &rarr;</div>
              </CardContent>
            </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

