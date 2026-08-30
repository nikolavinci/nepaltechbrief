import { fetchArticles } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

async function fetchTeamMember(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/wp/v2', '')}/neptech/v1/team/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await fetchTeamMember(slug);
  if (!person) return {};

  const name = `${person.first_name || ''} ${person.last_name || ''}`.trim() || person.slug;
  const title = `${name} - ${person.designation || 'Team Member'} | NepTechBrief`;
  const description = person.short_bio || `Learn more about ${name}, ${person.designation || 'a team member'} at NepTechBrief.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [person.profile_picture || 'https://neptechbrief.com/logo.png'],
    }
  };
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/wp/v2', '')}/neptech/v1/team`);
    if (!res.ok) return [];
    const team = await res.json();
    return team.map((p: any) => ({ slug: p.slug }));
  } catch (e) {
    return [];
  }
}

export default async function EntityProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await fetchTeamMember(slug);
  
  if (!person) notFound();

  const name = `${person.first_name || ''} ${person.last_name || ''}`.trim() || person.slug;
  const role = person.designation || 'Team Member';
  const imageUrl = person.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e2e8f0&color=64748b&bold=true&size=300`;

  // Fetch articles related to this person (by author name match)
  const { data: allArticles } = await fetchArticles(1, 100);
  const relatedArticles = allArticles.filter((a: any) => 
    a.author?.slug === slug || 
    (a.author?.name && a.author.name.toLowerCase().includes(name.toLowerCase()))
  );

  // Generate AEO/SEO/GEO JSON-LD Graph
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `https://neptechbrief.com/team/${slug}/#profilepage`,
        'url': `https://neptechbrief.com/team/${slug}/`,
        'name': `${name} - Profile`,
        'mainEntity': {
          '@id': person.canonical_id
        }
      },
      {
        '@type': 'Person',
        '@id': person.canonical_id,
        'name': name,
        'givenName': person.first_name || undefined,
        'familyName': person.last_name || undefined,
        'jobTitle': role,
        'description': person.short_bio || undefined,
        'image': person.profile_picture || undefined,
        'url': `https://neptechbrief.com/team/${slug}/`,
        'worksFor': {
          '@type': 'Organization',
          '@id': 'https://neptechbrief.com/#organization',
          'name': person.organization || 'NepTechBrief'
        },
        'sameAs': person.same_as?.map((s: any) => s.url) || [],
        'alumniOf': person.education?.map((e: any) => ({
          '@type': 'EducationalOrganization',
          'name': e.institution
        })) || undefined,
        'award': person.awards?.map((a: any) => a.name) || undefined,
        'knowsAbout': person.expertise ? person.expertise.split(',').map((e:string) => e.trim()) : undefined
      }
    ]
  };

  return (
    <div className="container mx-auto px-6 sm:px-8 xl:px-4 py-12 max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Left Column: Identity & Bio */}
        <div className="md:col-span-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 border-b pb-10">
            <div className="w-48 h-48 rounded-full overflow-hidden flex-shrink-0 border-4 border-muted shadow-lg relative">
              <Image src={imageUrl} alt={name} fill className="object-cover" sizes="192px" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">{name}</h1>
              <h2 className="text-2xl text-primary font-semibold mb-4">{role}</h2>
              {person.organization && <p className="text-lg text-muted-foreground font-medium mb-4">at {person.organization}</p>}
              
              {/* External Profiles (sameAs) */}
              {person.same_as && person.same_as.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                  {person.same_as.map((sa: any, i: number) => (
                    <a key={i} href={sa.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-muted rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors">
                      {sa.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <h3 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">Biography</h3>
            {person.full_bio ? (
              <div dangerouslySetInnerHTML={{ __html: person.full_bio }} />
            ) : (
              <p>{person.short_bio}</p>
            )}
          </div>

          {/* AI Search Optimization: AEO Clear Answers */}
          <div className="bg-muted/30 rounded-xl p-8 mb-12">
            <h3 className="text-2xl font-bold mb-6 border-b pb-4">Quick Facts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {person.expertise && (
                <div>
                  <h4 className="font-bold text-primary mb-2">Expertise</h4>
                  <p className="text-muted-foreground">{person.expertise}</p>
                </div>
              )}
              {person.organization && (
                <div>
                  <h4 className="font-bold text-primary mb-2">Organization</h4>
                  <p className="text-muted-foreground">{person.organization}</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Entity Relationships (Sidebar) */}
        <div className="md:col-span-4 space-y-8">
          
          {/* Education */}
          {person.education && person.education.length > 0 && (
            <div className="bg-card shadow-sm border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
                Education
              </h3>
              <ul className="space-y-4">
                {person.education.map((edu: any, i: number) => (
                  <li key={i}>
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Awards */}
          {person.awards && person.awards.length > 0 && (
            <div className="bg-card shadow-sm border rounded-xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                Awards & Honors
              </h3>
              <ul className="space-y-4">
                {person.awards.map((aw: any, i: number) => (
                  <li key={i}>
                    <p className="font-semibold">{aw.name}</p>
                    <p className="text-sm text-muted-foreground">{aw.org}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
      
      {/* Media Coverage / Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-16 pt-12 border-t">
          <h3 className="text-3xl font-bold mb-8">Articles by {name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.slice(0, 6).map((article: any) => (
              <Link key={article.id} href={`/news/${article.slug}`} className="group block">
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden mb-4 bg-muted">
                  <Image src={article.featured_image || 'https://placehold.co/600x400'} alt="Article" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-2">{article.title_en || article.title_np}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}


