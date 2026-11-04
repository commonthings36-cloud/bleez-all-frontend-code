import React, { useEffect, useState } from 'react';
import { fetchEligibleCampaigns } from '../services/campaignClientService';
import { Sparkles, Tag, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';

export const CampaignBanner = ({ placement = 'HOME_HERO', className = '' }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchEligibleCampaigns(placement, 'WEB')
      .then((data) => {
        if (isMounted) {
          const sorted = (data || []).sort((a, b) => (b.priority || 5) - (a.priority || 5));
          setCampaigns(sorted);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCampaigns([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [placement]);

  // Auto-rotate campaigns every 6 seconds if there are multiple
  useEffect(() => {
    if (campaigns.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % campaigns.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [campaigns]);

  if (dismissed || loading || !campaigns.length) {
    return null;
  }

  const activeCampaign = campaigns[currentIndex] || campaigns[0];
  const content = activeCampaign?.content?.web || activeCampaign?.content?.mobile || {};
  const title = content.title || activeCampaign?.name || activeCampaign?.title || 'Special Promotional Offer';
  const subtitle = content.subtitle || content.description || activeCampaign?.objective || '';
  const imageUrl = content.image_url || content.imageUrl || activeCampaign?.imageUrl;
  const ctaText = content.cta_text || content.ctaText || 'Explore Deals';
  const ctaLink = content.cta_link || content.ctaLink || '/plan';
  const couponCode = content.coupon_code || content.couponCode;

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? campaigns.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  const handleCtaClick = () => {
    if (ctaLink) {
      if (ctaLink.startsWith('http')) {
        window.open(ctaLink, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = ctaLink;
      }
    } else {
      window.location.href = '/plan';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-xl transition-all duration-500 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        color: '#ffffff',
      }}
    >
      {imageUrl && (
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 z-20"
        title="Dismiss campaign"
      >
        <X size={18} />
      </button>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles size={14} />
              Featured Promotion {campaigns.length > 1 ? `(${currentIndex + 1}/${campaigns.length})` : ''}
            </span>

            {couponCode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Tag size={12} />
                Code: {couponCode}
              </span>
            )}
          </div>

          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-1">
            {title}
          </h3>

          {subtitle && (
            <p className="text-sm md:text-base text-slate-200 opacity-90 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-2 md:mt-0 flex items-center gap-3 flex-shrink-0">
          {/* Carousel Arrows if multiple campaigns exist */}
          {campaigns.length > 1 && (
            <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 border border-white/10">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                title="Previous Campaign"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs font-mono px-1.5 text-white/70">
                {currentIndex + 1}/{campaigns.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
                title="Next Campaign"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <button
            onClick={handleCtaClick}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-indigo-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-lg hover:shadow-amber-400/25 active:scale-95"
          >
            <span>{ctaText}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
