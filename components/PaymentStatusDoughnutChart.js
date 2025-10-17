import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const PaymentStatusDoughnutChart = ({ users }) => {
    const paymentStatusCounts = users.reduce((acc, user) => {
        const status = user.paymentStatus === 'success' ? 'Paid' : 'Pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(paymentStatusCounts),
        datasets: [
            {
                label: 'Payment Status',
                data: Object.values(paymentStatusCounts),
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return <Doughnut data={data} />;
};