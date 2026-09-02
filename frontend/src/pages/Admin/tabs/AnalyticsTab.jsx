import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Users, TrendingUp, ShoppingBag, Globe, Instagram, MessageCircle, Search, Share2 } from "lucide-react";
import { API } from "@/lib/config";

// Traffic Sources Component
const TrafficSourcesCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/analytics/traffic-sources?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch traffic sources:", err);
    }
    setLoading(false);
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case "Instagram": return <div className="w-5 h-5 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded flex items-center justify-center text-white text-xs font-bold">I</div>;
      case "Facebook": return <div className="w-5 h-5 bg-[#1877F2] rounded flex items-center justify-center text-white text-xs font-bold">f</div>;
      case "WhatsApp": return <div className="w-5 h-5 bg-[#25D366] rounded flex items-center justify-center text-white text-xs font-bold">W</div>;
      case "Google": return <Search size={18} className="text-[#4285F4]" />;
      case "Twitter/X": return <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-xs font-bold">X</div>;
      case "Direct": return <Globe size={18} className="text-[#D4AF37]" />;
      default: return <Share2 size={18} className="text-[#A0A5B0]" />;
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case "Instagram": return "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]";
      case "Facebook": return "bg-[#1877F2]";
      case "WhatsApp": return "bg-[#25D366]";
      case "Google": return "bg-[#4285F4]";
      case "Twitter/X": return "bg-black";
      case "Direct": return "bg-[#D4AF37]";
      default: return "bg-[#A0A5B0]";
    }
  };

  if (loading) return <div className="text-[#A0A5B0] text-center py-8">Loading traffic sources...</div>;

  return (
    <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#F5F5F0] font-bold flex items-center gap-2">
          <Globe className="text-[#D4AF37]" size={20} />
          Traffic Sources
        </h3>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-[#050A14] border border-[#D4AF37]/20 rounded px-2 py-1 text-sm text-[#F5F5F0]"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {!data || data.sources.length === 0 ? (
        <p className="text-[#A0A5B0] text-center py-4">No traffic data yet</p>
      ) : (
        <>
          <p className="text-sm text-[#A0A5B0] mb-4">
            Total Views: <span className="text-[#F5F5F0] font-bold">{data.total_views.toLocaleString()}</span>
          </p>
          
          <div className="space-y-3">
            {data.sources.map((source, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getSourceIcon(source.source)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[#F5F5F0] text-sm font-medium">{source.source}</span>
                    <span className="text-[#A0A5B0] text-sm">{source.count.toLocaleString()} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#050A14] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getSourceColor(source.source)} rounded-full transition-all duration-500`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const AnalyticsTab = ({
  analyticsSummary,
  dailyViews,
  categoryBreakdown,
  popularTalents,
  partyStats,
  adStats,
  recentActivity,
  shareAnalytics,
  storeAnalytics
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-2">
            <Eye className="text-[#D4AF37]" size={18} />
            <span className="text-xs text-green-400">+{analyticsSummary?.traffic?.week_views || 0} this week</span>
          </div>
          <p className="text-2xl font-bold text-[#F5F5F0]">{analyticsSummary?.traffic?.total_page_views?.toLocaleString() || 0}</p>
          <p className="text-xs text-[#A0A5B0]">Total Page Views</p>
        </div>
        <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-[#D4AF37]" size={18} />
            <span className="text-xs text-[#A0A5B0]">{analyticsSummary?.traffic?.unique_visitors || 0} unique</span>
          </div>
          <p className="text-2xl font-bold text-[#F5F5F0]">{analyticsSummary?.traffic?.today_views || 0}</p>
          <p className="text-xs text-[#A0A5B0]">Today&apos;s Views</p>
        </div>
        <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-400" size={18} />
            <span className="text-xs text-yellow-400">{analyticsSummary?.talents?.pending || 0} pending</span>
          </div>
          <p className="text-2xl font-bold text-[#F5F5F0]">{analyticsSummary?.talents?.total || 0}</p>
          <p className="text-xs text-[#A0A5B0]">Registered Talents</p>
        </div>
        <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-green-400" size={18} />
          </div>
          <p className="text-2xl font-bold text-[#F5F5F0]">{analyticsSummary?.talents?.total_votes || 0}</p>
          <p className="text-xs text-[#A0A5B0]">Total Votes</p>
        </div>
        <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-2">
            <ShoppingBag className="text-purple-400" size={18} />
            <span className="text-xs text-yellow-400">{storeAnalytics?.pendingOrders || 0} pending</span>
          </div>
          <p className="text-2xl font-bold text-[#F5F5F0]">{storeAnalytics?.totalOrders || 0}</p>
          <p className="text-xs text-[#A0A5B0]">Store Orders</p>
        </div>
        <div className="bg-[#0A1628] rounded-xl p-4 border border-[#D4AF37]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#D4AF37] font-bold">₹</span>
          </div>
          <p className="text-2xl font-bold text-[#F5F5F0]">₹{(storeAnalytics?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-xs text-[#A0A5B0]">Store Revenue</p>
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-[#0A1628] to-[#0A1628]/50 rounded-xl p-4 border border-[#D4AF37]/10">
          <p className="text-[#A0A5B0] text-xs mb-1">Party Events</p>
          <p className="text-xl font-bold text-[#F5F5F0]">{analyticsSummary?.content?.total_parties || 0}</p>
          <p className="text-xs text-green-400">{analyticsSummary?.content?.active_parties || 0} active</p>
        </div>
        <div className="bg-gradient-to-br from-[#0A1628] to-[#0A1628]/50 rounded-xl p-4 border border-[#D4AF37]/10">
          <p className="text-[#A0A5B0] text-xs mb-1">Advertisements</p>
          <p className="text-xl font-bold text-[#F5F5F0]">{analyticsSummary?.content?.total_ads || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0A1628] to-[#0A1628]/50 rounded-xl p-4 border border-[#D4AF37]/10">
          <p className="text-[#A0A5B0] text-xs mb-1">Magazines</p>
          <p className="text-xl font-bold text-[#F5F5F0]">{analyticsSummary?.content?.total_magazines || 0}</p>
          <p className="text-xs text-[#D4AF37]">{analyticsSummary?.content?.total_magazine_pages || 0} pages</p>
        </div>
        <div className="bg-gradient-to-br from-[#0A1628] to-[#0A1628]/50 rounded-xl p-4 border border-[#D4AF37]/10">
          <p className="text-[#A0A5B0] text-xs mb-1">Approved Talents</p>
          <p className="text-xl font-bold text-[#F5F5F0]">{analyticsSummary?.talents?.approved || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-[#0A1628] to-[#0A1628]/50 rounded-xl p-4 border border-[#D4AF37]/10">
          <p className="text-[#A0A5B0] text-xs mb-1">This Month Views</p>
          <p className="text-xl font-bold text-[#F5F5F0]">{analyticsSummary?.traffic?.month_views?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Views Chart */}
        <div className="lg:col-span-2 bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#F5F5F0]">Daily Views (Last 30 Days)</h3>
            <button 
              onClick={() => window.open(`${API}/admin/analytics/export`, '_blank')}
              className="px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded text-sm hover:bg-[#D4AF37]/30"
            >
              Export CSV
            </button>
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {dailyViews.slice(-14).map((d, i) => {
              const maxViews = Math.max(...dailyViews.map(x => x.views), 1);
              const percentage = (d.views / maxViews) * 100;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#A0A5B0] text-xs w-20">{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  <div className="flex-1 bg-[#050A14] rounded-full h-5 overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] h-full rounded-full transition-all duration-300" 
                      style={{ width: `${Math.max(percentage, 2)}%` }} 
                    />
                    {d.views > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#050A14] font-bold">{d.views}</span>
                    )}
                  </div>
                  <span className="text-[#F5F5F0] text-xs w-12 text-right">{d.views}</span>
                </div>
              );
            })}
            {dailyViews.length === 0 && (
              <div className="text-center py-8 text-[#A0A5B0]">
                <Eye size={32} className="mx-auto mb-2 opacity-50" />
                <p>No view data yet</p>
                <p className="text-xs">Views will appear here once visitors browse the site</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
          <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Talent Categories</h3>
          <div className="space-y-3">
            {categoryBreakdown.slice(0, 8).map((cat, i) => {
              const total = categoryBreakdown.reduce((sum, c) => sum + c.count, 0);
              const percentage = total > 0 ? (cat.count / total) * 100 : 0;
              const colors = ['bg-[#D4AF37]', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-red-500'];
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A0A5B0]">{cat._id}</span>
                    <span className="text-[#F5F5F0]">{cat.count}</span>
                  </div>
                  <div className="w-full bg-[#050A14] rounded-full h-2">
                    <div className={`${colors[i % colors.length]} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Traffic Sources Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficSourcesCard />
      </div>

      {/* Popular Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Talents */}
        <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
          <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Most Viewed Profiles</h3>
          <div className="space-y-2">
            {popularTalents.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-[#050A14] rounded-lg">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-[#D4AF37] text-[#050A14]' : i === 1 ? 'bg-gray-400 text-[#050A14]' : i === 2 ? 'bg-orange-600 text-white' : 'bg-[#0A1628] text-[#A0A5B0]'}`}>
                  {i + 1}
                </span>
                {t.profile_image && <img src={t.profile_image} alt="" className="w-8 h-8 rounded-full object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F0] font-medium text-sm truncate">{t.name}</p>
                  <p className="text-[#A0A5B0] text-xs truncate">{t.category}</p>
                </div>
                <span className="text-[#D4AF37] text-sm font-bold">{t.views}</span>
              </div>
            ))}
            {popularTalents.length === 0 && (
              <p className="text-[#A0A5B0] text-sm text-center py-4">No profile views yet</p>
            )}
          </div>
        </div>

        {/* Party Stats */}
        <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
          <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Popular Events</h3>
          <div className="space-y-2">
            {partyStats.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-[#050A14] rounded-lg">
                <span className="text-[#D4AF37] font-bold text-sm">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F0] font-medium text-sm truncate">{p.title}</p>
                  <p className="text-[#A0A5B0] text-xs truncate">{p.venue}</p>
                </div>
                <span className="text-[#D4AF37] text-sm">{p.views} views</span>
              </div>
            ))}
            {partyStats.length === 0 && (
              <p className="text-[#A0A5B0] text-sm text-center py-4">No event views yet</p>
            )}
          </div>
        </div>

        {/* Ad Performance */}
        <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
          <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Ad Performance</h3>
          <div className="space-y-2">
            {adStats.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-[#050A14] rounded-lg">
                <span className="text-[#D4AF37] font-bold text-sm">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F0] font-medium text-sm truncate">{a.title}</p>
                  <p className="text-[#A0A5B0] text-xs truncate">{a.link}</p>
                </div>
                <span className="text-green-400 text-sm">{a.clicks} clicks</span>
              </div>
            ))}
            {adStats.length === 0 && (
              <p className="text-[#A0A5B0] text-sm text-center py-4">No ad clicks yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
        <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentActivity.length > 0 ? (
            recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#D4AF37]/10 last:border-0">
                <span className={`w-2 h-2 rounded-full ${
                  a.event_type === 'page_view' ? 'bg-blue-500' : 
                  a.event_type === 'talent_view' ? 'bg-green-500' : 
                  a.event_type === 'party_view' ? 'bg-purple-500' :
                  a.event_type === 'ad_click' ? 'bg-orange-500' : 'bg-[#D4AF37]'
                }`}></span>
                <span className="text-[#F5F5F0] text-sm">
                  {a.event_type === 'talent_view' ? `Viewed profile: ${a.talent_name || 'Unknown'}` :
                   a.event_type === 'party_view' ? `Viewed event: ${a.party_title || 'Unknown'}` :
                   a.event_type === 'ad_click' ? `Clicked ad: ${a.ad_title || 'Unknown'}` :
                   `Page view: ${a.page || 'Home'}`}
                </span>
                <span className="text-[#A0A5B0] text-xs ml-auto">{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[#A0A5B0]">
              <p>No recent activity</p>
              <p className="text-xs">Activity will appear here as visitors browse the site</p>
            </div>
          )}
        </div>
      </div>

      {/* Share Analytics */}
      <div className="bg-[#0A1628] rounded-xl p-6 border border-[#D4AF37]/20">
        <h3 className="text-lg font-bold text-[#F5F5F0] mb-4">Share Analytics</h3>
        
        {/* Share Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#050A14] rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-[#F5F5F0]">{shareAnalytics?.total_shares || 0}</p>
            <p className="text-xs text-[#A0A5B0]">Total Shares</p>
          </div>
          <div className="bg-[#050A14] rounded-lg p-4 text-center">
            <div className="w-6 h-6 bg-[#25D366] rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold">W</div>
            <p className="text-xl font-bold text-[#F5F5F0]">{shareAnalytics?.by_type?.whatsapp || 0}</p>
            <p className="text-xs text-[#A0A5B0]">WhatsApp</p>
          </div>
          <div className="bg-[#050A14] rounded-lg p-4 text-center">
            <div className="w-6 h-6 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold">S</div>
            <p className="text-xl font-bold text-[#F5F5F0]">{shareAnalytics?.by_type?.story || 0}</p>
            <p className="text-xs text-[#A0A5B0]">Insta Story</p>
          </div>
          <div className="bg-[#050A14] rounded-lg p-4 text-center">
            <div className="w-6 h-6 bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full mx-auto mb-1 flex items-center justify-center text-white text-xs font-bold">F</div>
            <p className="text-xl font-bold text-[#F5F5F0]">{shareAnalytics?.by_type?.feed || 0}</p>
            <p className="text-xs text-[#A0A5B0]">Insta Feed</p>
          </div>
        </div>

        {/* Top Shared Talents */}
        <h4 className="text-sm font-bold text-[#D4AF37] mb-3">Top Shared Talents</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {shareAnalytics?.top_talents?.length > 0 ? (
            shareAnalytics.top_talents.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#050A14] rounded-lg">
                <span className="text-[#D4AF37] font-bold text-sm">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F5F0] font-medium text-sm truncate">{t.talent_name}</p>
                  <div className="flex gap-2 text-[10px] text-[#A0A5B0]">
                    <span className="text-[#25D366]">W: {t.whatsapp}</span>
                    <span className="text-pink-400">S: {t.story}</span>
                    <span className="text-orange-400">F: {t.feed}</span>
                  </div>
                </div>
                <span className="text-[#D4AF37] font-bold text-lg">{t.total}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[#A0A5B0]">
              <p>No shares yet</p>
              <p className="text-xs">Shares will appear here when talents share their profiles</p>
            </div>
          )}
        </div>

        {/* Recent Shares */}
        {shareAnalytics?.recent_shares?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-bold text-[#D4AF37] mb-3">Recent Shares</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {shareAnalytics.recent_shares.slice(0, 10).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1 border-b border-[#D4AF37]/10">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                    s.share_type === 'whatsapp' ? 'bg-[#25D366]' : 'bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#F77737]'
                  }`}>
                    {s.share_type === 'whatsapp' ? 'W' : s.share_type === 'story' ? 'S' : 'F'}
                  </span>
                  <span className="text-[#F5F5F0] flex-1 truncate">{s.talent_name}</span>
                  <span className="text-[#A0A5B0]">{new Date(s.timestamp).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#0A1628]/70 rounded-xl p-6 border border-[#D4AF37]/30">
        <h3 className="text-lg font-bold text-[#D4AF37] mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#050A14]/50 rounded-lg p-4">
            <p className="text-[#F5F5F0] font-medium">Top Category</p>
            <p className="text-[#D4AF37] text-lg font-bold">{categoryBreakdown[0]?.name || 'N/A'}</p>
            <p className="text-[#A0A5B0] text-xs">{categoryBreakdown[0]?.count || 0} talents</p>
          </div>
          <div className="bg-[#050A14]/50 rounded-lg p-4">
            <p className="text-[#F5F5F0] font-medium">Avg Daily Views</p>
            <p className="text-[#D4AF37] text-lg font-bold">
              {dailyViews.length > 0 ? Math.round(dailyViews.reduce((sum, d) => sum + d.views, 0) / dailyViews.length) : 0}
            </p>
            <p className="text-[#A0A5B0] text-xs">last 30 days</p>
          </div>
          <div className="bg-[#050A14]/50 rounded-lg p-4">
            <p className="text-[#F5F5F0] font-medium">Conversion Rate</p>
            <p className="text-[#D4AF37] text-lg font-bold">
              {analyticsSummary?.traffic?.total_page_views > 0 
                ? ((analyticsSummary?.talents?.total_votes || 0) / analyticsSummary.traffic.total_page_views * 100).toFixed(1) 
                : 0}%
            </p>
            <p className="text-[#A0A5B0] text-xs">votes per view</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
