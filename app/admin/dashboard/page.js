"use client"
import { useState, useEffect } from 'react';
import { Calendar, Users, Activity, X, Mail, Phone, Home, Ticket, BadgeCheck, Swords, Shirt } from 'lucide-react';
import { Pie, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement);

// --- Chart Components ---

// Line Chart for Registrations over time
const RegistrationsLineChart = ({ users, sportRegistrations, isLoading }) => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400"></div></div>;
    }

    const processData = (data) => {
        const countsByDate = data.reduce((acc, item) => {
            const date = new Date(item.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(countsByDate).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
    };
    
    const userEntries = processData(users);
    const sportEntries = processData(sportRegistrations);

    const allDates = [...new Set([...userEntries.map(([date]) => date), ...sportEntries.map(([date]) => date)])].sort((a, b) => new Date(a) - new Date(b));

    const userDataMap = new Map(userEntries);
    const sportDataMap = new Map(sportEntries);

    const data = {
        labels: allDates.map(date => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short'})),
        datasets: [
            {
                label: 'User Registrations',
                data: allDates.map(date => userDataMap.get(date) || 0),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.1
            },
            {
                label: 'Sports Registrations',
                data: allDates.map(date => sportDataMap.get(date) || 0),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Daily Registrations Trend', font: { size: 16, family: 'serif' } },
        },
        scales: { y: { beginAtZero: true } }
    };
    
    return <Line data={data} options={options} />;
};


// Pie Chart for Sports Distribution
const SportsDistributionPieChart = ({ sportRegistrations, isLoading }) => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400"></div></div>;
    }

    const sportsCounts = sportRegistrations.reduce((acc, reg) => {
        if (Array.isArray(reg.selectedSports)) {
            reg.selectedSports.forEach(sport => {
                acc[sport] = (acc[sport] || 0) + 1;
            });
        }
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(sportsCounts),
        datasets: [{
            data: Object.values(sportsCounts),
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(231, 23, 200, 0.7)',
                'rgba(100, 150, 132, 0.7)',
            ],
            borderColor: ['#ffffff'],
            borderWidth: 2,
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Sports Registration Distribution', font: { size: 16, family: 'serif' } },
        },
    };

    return <Pie data={chartData} options={options} />;
};

// Doughnut Chart for Payment Status
const PaymentStatusDoughnutChart = ({ users, isLoading }) => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-400"></div></div>;
    }
    const paymentStatusCounts = users.reduce((acc, user) => {
        const status = user.paymentStatus === 'success' ? 'Paid' : 'Pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(paymentStatusCounts),
        datasets: [{
            data: Object.values(paymentStatusCounts),
            backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)'],
            borderColor: ['#ffffff'],
            borderWidth: 2,
        }],
    };

     const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Registrations by Payment Status', font: { size: 16, family: 'serif' } },
        },
    };

    return <Doughnut data={data} options={options} />;
};


// --- Main Dashboard Component ---

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalSportRegistrations: 0 });
  const [users, setUsers] = useState([]);
  const [sportRegistrations, setSportRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedSportRegistration, setSelectedSportRegistration] = useState(null);


  const [filters, setFilters] = useState({
    memberType: '',
    paymentStatus: 'PAID', // Default to 'PAID'
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v != null && v !== '')
      );
      const query = new URLSearchParams(activeFilters).toString();

      try {
        const response = await fetch(`/api/admin/stats?${query}`);
        const data = await response.json();
        setStats({
          totalUsers: data.totalUsers,
          totalSportRegistrations: data.totalSportRegistrations
        });
        setUsers(data.users || []);
        setSportRegistrations(data.sportRegistrations || []);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      memberType: '',
      paymentStatus: '',
      startDate: '',
      endDate: '',
    });
  };

  const handleUserClick = (user) => setSelectedUser(user);
  const handleCloseUserModal = () => setSelectedUser(null);
  const handleSportRegistrationClick = (reg) => setSelectedSportRegistration(reg);
  const handleCloseSportRegistrationModal = () => setSelectedSportRegistration(null);

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const getStatusBadge = (status) => {
    const statusStyles = {
      'success': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      'pending': 'bg-amber-100 text-amber-800 border border-amber-200',
      'IDA_MEMBER': 'bg-blue-100 text-blue-800 border border-blue-200',
      'NON_MEMBER': 'bg-slate-100 text-slate-800 border border-slate-200',
    };
    return statusStyles[status] || 'bg-slate-100 text-slate-800 border border-slate-200';
  };

  const formatStatus = (status) => {
    if (!status) return 'N/A';
    if (status === 'success') return 'Paid';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-serif text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-600 text-sm">Manage registrations and monitor activity</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-700" /> Filter & Search
              </h2>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" /> Clear Filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Filter Controls */}
                <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Member Type</label>
                    <select name="memberType" value={filters.memberType} onChange={handleFilterChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition">
                    <option value="">All Types</option>
                    <option value="IDA_MEMBER">IDA Member</option>
                    <option value="NON_MEMBER">Non-Member</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Payment Status</label>
                    <select name="paymentStatus" value={filters.paymentStatus} onChange={handleFilterChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition">
                    <option value="">All Statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Start Date</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">End Date</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition" />
                </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                <div>
                    <h3 className="font-serif text-slate-800">User Registrations</h3>
                    <p className="text-4xl font-light text-slate-900 mt-2">{loading ? '...' : stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-blue-600" /></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                <div>
                    <h3 className="font-serif text-slate-800">Sports Registrations</h3>
                    <p className="text-4xl font-light text-slate-900 mt-2">{loading ? '...' : stats.totalSportRegistrations}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center"><Activity className="w-6 h-6 text-emerald-600" /></div>
            </div>
          </section>

          <section className="space-y-8 mb-10">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200"><h3 className="text-lg font-serif text-slate-900">User Registrations ({loading ? '...' : users.length})</h3></div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">Member Type</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                           {loading ? Array.from({length: 5}).map((_, i) => (
                                <tr key={i} className="animate-pulse"><td className="px-6 py-4" colSpan="4"><div className="h-4 bg-slate-200 rounded"></div></td></tr>
                            )) : users.length > 0 ? users.map((user) => (
                                    <tr key={user.id} onClick={() => handleUserClick(user)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{user.email}</td>
                                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.memberType)}`}>{formatStatus(user.memberType)}</span></td>
                                        <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.paymentStatus)}`}>{formatStatus(user.paymentStatus)}</span></td>
                                    </tr>
                                )) : <tr><td colSpan="4" className="text-center py-12 text-slate-500">No users found.</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200"><h3 className="text-lg font-serif text-slate-900">Sports Registrations ({loading ? '...' : sportRegistrations.length})</h3></div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">Age</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">Member Type</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase tracking-wider">Sports</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-slate-200">
                           {loading ? Array.from({length: 5}).map((_, i) => (
                                <tr key={i} className="animate-pulse"><td className="px-6 py-4" colSpan="4"><div className="h-4 bg-slate-200 rounded"></div></td></tr>
                            )) : sportRegistrations.length > 0 ? sportRegistrations.map((reg) => (
                                <tr key={reg.id} onClick={() => handleSportRegistrationClick(reg)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-slate-900">{reg.name}</td>
                                    <td className="px-6 py-4 text-slate-600">{reg.age}</td>
                                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(reg.memberType)}`}>{formatStatus(reg.memberType)}</span></td>
                                    <td className="px-6 py-4 text-slate-600">{Array.isArray(reg.selectedSports) ? reg.selectedSports.join(', ') : ''}</td>
                                </tr>
                            )) : <tr><td colSpan="4" className="text-center py-12 text-slate-500">No sports registrations found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
          </section>

          <section className="space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <RegistrationsLineChart users={users} sportRegistrations={sportRegistrations} isLoading={loading} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <PaymentStatusDoughnutChart users={[...users, ...sportRegistrations]} isLoading={loading} />
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <SportsDistributionPieChart sportRegistrations={sportRegistrations} isLoading={loading} />
                  </div>
              </div>
          </section>
        </main>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleCloseUserModal}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-serif text-slate-900">{selectedUser.name}</h2>
                    <p className="text-sm text-slate-500">{selectedUser.memberId || 'No Member ID'}</p>
                 </div>
                  <button onClick={handleCloseUserModal} className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full -mt-2 -mr-2"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 space-y-4 bg-slate-50">
                  <div className="flex items-center gap-4"><Mail className="w-5 h-5 text-slate-500 flex-shrink-0" /><span className="text-slate-800 break-all">{selectedUser.email}</span></div>
                  <div className="flex items-center gap-4"><Phone className="w-5 h-5 text-slate-500 flex-shrink-0" /><span className="text-slate-800">{selectedUser.mobile || 'Not Provided'}</span></div>
                  <div className="flex items-start gap-4"><Home className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" /><span className="text-slate-800">{selectedUser.address || 'Not Provided'}</span></div>
              </div>
              <div className="p-6 flex flex-wrap gap-4 items-center justify-between border-t">
                  <div className="flex items-center gap-3"><Ticket className="w-5 h-5 text-slate-500" /><span className="text-slate-700 font-medium">{formatStatus(selectedUser.memberType)}</span></div>
                  <div className="flex items-center gap-3"><BadgeCheck className="w-5 h-5 text-slate-500" /><span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusBadge(selectedUser.paymentStatus)}`}>{formatStatus(selectedUser.paymentStatus)}</span></div>
              </div>
          </div>
        </div>
      )}

      {selectedSportRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleCloseSportRegistrationModal}>
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-serif text-slate-900">{selectedSportRegistration.name}</h2>
                        <p className="text-sm text-slate-500">Age: {selectedSportRegistration.age}, Gender: {selectedSportRegistration.gender}</p>
                    </div>
                    <button onClick={handleCloseSportRegistrationModal} className="text-slate-400 hover:text-slate-800 transition-colors p-1 rounded-full -mt-2 -mr-2"><X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4 bg-slate-50">
                  <div className="flex items-center gap-4"><Mail className="w-5 h-5 text-slate-500 flex-shrink-0" /><span className="text-slate-800 break-all">{selectedSportRegistration.email}</span></div>
                  <div className="flex items-center gap-4"><Phone className="w-5 h-5 text-slate-500 flex-shrink-0" /><span className="text-slate-800">{selectedSportRegistration.mobile || 'Not Provided'}</span></div>
                  <div className="flex items-center gap-4"><Shirt className="w-5 h-5 text-slate-500 flex-shrink-0" /><span className="text-slate-800">T-Shirt Size: {selectedSportRegistration.tshirtSize}</span></div>
                  <div className="flex items-start gap-4"><Swords className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" /><span className="text-slate-800 font-medium">Sports: {selectedSportRegistration.selectedSports.join(', ')}</span></div>
                </div>
                <div className="p-6 flex flex-wrap gap-4 items-center justify-between border-t">
                  <div className="flex items-center gap-3"><Ticket className="w-5 h-5 text-slate-500" /><span className="text-slate-700 font-medium">{formatStatus(selectedSportRegistration.memberType)}</span></div>
                  <div className="flex items-center gap-3"><BadgeCheck className="w-5 h-5 text-slate-500" /><span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusBadge(selectedSportRegistration.paymentStatus)}`}>{formatStatus(selectedSportRegistration.paymentStatus)}</span></div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}

