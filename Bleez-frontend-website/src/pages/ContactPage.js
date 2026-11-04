import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, LifeBuoy, ShieldAlert, MessageCircleQuestion } from 'lucide-react';
import { Navbar, Footer } from '../components/Layout';
import PageHero from '../components/PageHero';
import { Button } from '../components/ui/button';
import { SITE, mailtoHref } from '../lib/site';
import { IMG } from '../data/travelImages';

const field = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', topic: '', message: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const hasEmail = Boolean(SITE.supportEmail);

  // There is no contact-form API, so the message is composed in the visitor's own email app.
  const submit = (e) => {
    e.preventDefault();
    window.location.href = mailtoHref(form.topic || 'Question for Bleez', `${form.message}\n\n— ${form.name}`);
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid="contact-page">
      <Navbar />
      <PageHero image={IMG.paris(1800)} eyebrow="Contact us" title="We're here to help" subtitle="Questions about planning, booking or your account? Reach out." />
      <main className="flex-1 container-main py-12 md:py-20 grid lg:grid-cols-5 gap-10">
        <aside className="lg:col-span-2 space-y-4">
          {[
            { icon: MessageCircleQuestion, title: 'Check the FAQ', text: 'Most questions are answered in a minute.', to: '/faq', label: 'Browse FAQs' },
            { icon: LifeBuoy, title: 'Help Center', text: 'Guides for planning, booking and your account.', to: '/help', label: 'Open Help Center' },
            { icon: ShieldAlert, title: 'In an emergency', text: 'Contact local emergency services first. Find numbers for where you are.', to: '/emergency', label: 'Emergency numbers' },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="group flex gap-4 rounded-3xl border border-border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <span className="w-12 h-12 shrink-0 rounded-2xl bg-brand-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors"><c.icon className="w-6 h-6" /></span>
              <span>
                <span className="block font-bold">{c.title}</span>
                <span className="block text-sm text-muted-foreground">{c.text}</span>
                <span className="block text-sm font-semibold text-primary mt-1">{c.label} →</span>
              </span>
            </Link>
          ))}
        </aside>

        <section className="lg:col-span-3 self-start rounded-3xl border border-border bg-card p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Send us a message</h2>
          {hasEmail ? (
            <>
              <p className="text-muted-foreground mb-6">This opens your email app with your message ready to send to <span className="font-semibold text-foreground">{SITE.supportEmail}</span>.</p>
              <form onSubmit={submit} className="space-y-4">
                <label className="block"><span className="block text-sm font-semibold mb-1.5">Your name</span><input required value={form.name} onChange={set('name')} className={field} autoComplete="name" /></label>
                <label className="block"><span className="block text-sm font-semibold mb-1.5">Subject</span><input required value={form.topic} onChange={set('topic')} className={field} /></label>
                <label className="block"><span className="block text-sm font-semibold mb-1.5">Message</span><textarea required rows={6} value={form.message} onChange={set('message')} className={field} /></label>
                <Button type="submit" className="rounded-full px-8 py-6 text-base gap-2"><Mail className="w-5 h-5" /> Compose email</Button>
              </form>
            </>
          ) : (
            <div className="mt-4 rounded-2xl bg-muted p-6">
              <p className="font-semibold mb-1">Email support isn't available on this site yet.</p>
              <p className="text-muted-foreground">In the meantime, the FAQ and Help Center cover most questions.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
