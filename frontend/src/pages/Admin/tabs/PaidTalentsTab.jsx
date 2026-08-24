const PaidTalentsTab = ({ paidTalents, loading, paidSearchFilter, setPaidSearchFilter }) => {
  const filteredTalents = paidTalents.filter(t => 
    !paidSearchFilter || 
    t.name?.toLowerCase().includes(paidSearchFilter.toLowerCase()) ||
    t.email?.toLowerCase().includes(paidSearchFilter.toLowerCase()) ||
    t.phone?.includes(paidSearchFilter)
  );

  return (
    <div className="bg-[#0A1628] rounded-xl p-4 md:p-6 border border-[#D4AF37]/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#F5F5F0]">Paid Talents</h2>
          <p className="text-[#A0A5B0] text-sm">Talents who have completed payment registration</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            {paidTalents.length} Paid
          </span>
          <input
            type="text"
            placeholder="Search by name, email..."
            value={paidSearchFilter}
            onChange={(e) => setPaidSearchFilter(e.target.value)}
            className="px-3 py-2 bg-[#050A14] border border-[#D4AF37]/20 rounded-lg text-[#F5F5F0] text-sm w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#A0A5B0]">Loading paid talents...</div>
      ) : paidTalents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#A0A5B0] text-lg mb-2">No paid talents yet</p>
          <p className="text-[#A0A5B0] text-sm">Talents who complete payment will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/20">
                <th className="text-left py-3 px-4 text-[#D4AF37] text-sm font-medium">Talent</th>
                <th className="text-left py-3 px-4 text-[#D4AF37] text-sm font-medium">Category</th>
                <th className="text-left py-3 px-4 text-[#D4AF37] text-sm font-medium">Contact</th>
                <th className="text-left py-3 px-4 text-[#D4AF37] text-sm font-medium">Payment</th>
                <th className="text-left py-3 px-4 text-[#D4AF37] text-sm font-medium">Paid On</th>
                <th className="text-left py-3 px-4 text-[#D4AF37] text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTalents.map((t, i) => (
                <tr key={i} className="border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {t.profile_image ? (
                        <img src={t.profile_image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                          {t.name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-[#F5F5F0] font-medium">{t.name}</p>
                        <p className="text-[#A0A5B0] text-xs">{t.talent_id?.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded text-xs">
                      {t.category || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[#F5F5F0] text-sm">{t.email}</p>
                    <p className="text-[#A0A5B0] text-xs">{t.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-green-400 font-medium">₹{(t.payment_amount / 100).toLocaleString()}</p>
                    <p className="text-[#A0A5B0] text-xs truncate max-w-[120px]" title={t.payment_id}>
                      {t.payment_id?.slice(0, 12)}...
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-[#F5F5F0] text-sm">
                      {t.paid_at ? new Date(t.paid_at).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-[#A0A5B0] text-xs">
                      {t.paid_at ? new Date(t.paid_at).toLocaleTimeString() : ''}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      t.is_approved 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {t.is_approved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaidTalentsTab;
