import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const MemberTypePieChart = ({ users }) => {
  const memberTypeCounts = users.reduce((acc, user) => {
    acc[user.memberType] = (acc[user.memberType] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(memberTypeCounts),
    datasets: [
      {
        label: '# of Votes',
        data: Object.values(memberTypeCounts),
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Pie data={data} />;
};