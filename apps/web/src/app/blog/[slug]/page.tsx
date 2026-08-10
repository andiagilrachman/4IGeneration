import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ParticleField } from "@/components/cosmic/particle-field";
import { RichText } from "@/components/blog/rich-text";
import { blogPosts, formatDate, getAllSlugs, getPost } from "@/lib/blog";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: "Artikel tidak ditemukan — 4IGeneration" };
  return {
    title: `${post.title} — 4IGeneration Blog`,
    description: post.excerpt,
    keywords: post.tags.join(", "),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    keywords: post.tags.join(", "),
  };

  return (
    <main className="relative min-h-screen bg-bg-deep bg-cosmic-radial text-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ParticleField density={12} />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/blog"
          className="font-mono text-xs text-text-muted transition-colors hover:text-primary"
        >
          ← Kembali ke Blog
        </Link>

        <article className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-primary/40 px-3 py-1 font-mono uppercase tracking-wider text-highlight">
              {post.category}
            </span>
            <span className="text-text-muted">
              {formatDate(post.date)} · {post.readMinutes} menit baca
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/15 font-display text-xs font-bold text-primary">
              {post.author.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold">{post.author}</p>
              <p className="text-xs text-text-muted">{post.tags.map((t) => `#${t}`).join("  ")}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-8">
            <RichText content={post.content} />
          </div>
        </article>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center">
          <h3 className="font-display text-lg font-bold">Siap mencoba analisis AI?</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Screening 28+ saham IDX, analisis emiten, dan market recap — gratis untuk memulai.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-glow-purple hover:bg-primary-hover"
            >
              Mulai Gratis
            </Link>
            <Link
              href="/screener"
              className="rounded-lg border border-white/10 bg-bg-elevated px-5 py-2 text-sm font-semibold text-text-secondary hover:border-primary/40 hover:text-text-primary"
            >
              Coba Screener
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
