import { Card, CardContent } from "@/components/ui/card";
import { fetchTeamMembers } from "@/lib/api";

export default async function TeamPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const isEn = lang === 'en';

  let team = await fetchTeamMembers();

  if (!team || team.length === 0) {
    team = [
      { profile_details: { first_name: 'Birendra', last_name: 'Sharma', designation: isEn ? 'Chairman / Publisher' : '??????? / ???????', short_bio: '' }, title: { rendered: 'Birendra Sharma' }, fallback_img: '11' },
      { profile_details: { first_name: 'Sita', last_name: 'Acharya', designation: isEn ? 'Editor-in-Chief' : '?????? ???????', short_bio: '' }, title: { rendered: 'Sita Acharya' }, fallback_img: '44' },
      { profile_details: { first_name: 'Ramesh', last_name: 'Karki', designation: isEn ? 'Managing Editor' : '??????? ???????', short_bio: '' }, title: { rendered: 'Ramesh Karki' }, fallback_img: '33' },
      { profile_details: { first_name: 'Anita', last_name: 'Gurung', designation: isEn ? 'Senior Tech Correspondent' : '?????? ??????? ?????????', short_bio: '' }, title: { rendered: 'Anita Gurung' }, fallback_img: '22' },
      { profile_details: { first_name: 'Sunil', last_name: 'Shrestha', designation: isEn ? 'Business Analyst' : '??????? ????????', short_bio: '' }, title: { rendered: 'Sunil Shrestha' }, fallback_img: '55' },
      { profile_details: { first_name: 'Dipendra', last_name: 'Thapa', designation: isEn ? 'Political Reporter' : '???????? ????????', short_bio: '' }, title: { rendered: 'Dipendra Thapa' }, fallback_img: '66' },
    ];
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
          {isEn ? 'Our Editorial Team' : '?????? ????????? ????'}
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          {isEn 
            ? 'Meet the dedicated journalists and tech experts behind NepTechBrief who work tirelessly to bring you accurate and timely information.' 
            : '??????????? ??????? ??????? ??????? ? ??????? ?????????????? ?????????? ???? ???????? ??? ? ?????????? ??????? ?????? ??? ?????? ???????'}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {team.map((member: any, i: number) => {
          const details = member.profile_details || {};
          const name = `${details.first_name || ''} ${details.last_name || ''}`.trim() || member.title?.rendered || 'Team Member';
          const role = details.designation || 'Editor';
          const imageUrl = details.profile_picture || (member.fallback_img ? `https://i.pravatar.cc/150?img=${member.fallback_img}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=64748b&bold=true&size=150`);
          
          return (
            <Card key={i} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow bg-card">
              <CardContent className="p-0 text-center flex flex-col items-center pt-8 pb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-muted">
                  <img src={imageUrl} alt={name} className="object-cover w-full h-full" />
                </div>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-primary font-semibold uppercase text-sm mt-1 tracking-wider">{role}</p>
                {details.short_bio && <p className="mt-3 text-sm text-muted-foreground px-6 line-clamp-3">{details.short_bio}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
