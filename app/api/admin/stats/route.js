import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Simplified search parameters
    const memberType = searchParams.get('memberType');
    const paymentStatus = searchParams.get('paymentStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Map frontend payment status to database values
    const paymentStatusMap = {
      'PAID': 'success',
      'PENDING': 'pending'
    };

    // Build a single, common where clause
    const whereClause = {};
    if (memberType) {
      whereClause.memberType = memberType;
    }
    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatusMap[paymentStatus];
    }
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)), // Include the whole end day
      };
    }

    console.log('Applying common where clause:', whereClause);

    // Fetch filtered data using the common where clause
    const users = await prisma.user.findMany({ 
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    const sportRegistrations = await prisma.sportRegistration.findMany({ 
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    // The counts are derived from the length of the filtered arrays
    const totalUsers = users.length;
    const totalSportRegistrations = sportRegistrations.length;

    console.log('Results:', {
      totalUsers,
      totalSportRegistrations
    });

    return NextResponse.json({
      totalUsers,
      totalSportRegistrations,
      users,
      sportRegistrations,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}