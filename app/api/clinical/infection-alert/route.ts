import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { patientId, diagnosis } = await request.json();

  // For this example, we'll hardcode Cholera as the infectious disease to track.
  if (diagnosis.toLowerCase() !== 'cholera') {
    return NextResponse.json({ message: 'Diagnosis is not a tracked infectious disease.' });
  }

  const patient = await prisma.patient.findUnique({ where: { id: patientId } });

  if (!patient || (!patient.phoneNumber && !patient.physicalAddress)) {
    return NextResponse.json({ message: 'Patient not found or has no contact info for family linking.' });
  }

  // Find linked family members
  const familyMembers = await prisma.patient.findMany({
    where: {
      OR: [
        { phoneNumber: patient.phoneNumber },
        { physicalAddress: patient.physicalAddress },
      ],
      NOT: {
        id: patientId,
      },
    },
  });

  // In a real app, you would flag their profiles and send a notification to the admin.
  // For this demo, we'll just return the family members found.

  // Create a system notification for the admin
  await prisma.systemNotification.create({
    data: {
      title: 'Infectious Disease Alert: Cholera',
      message: `Patient ${patient.name} (ID: ${patient.id}) was diagnosed with Cholera. ${familyMembers.length} linked family members found.`,
      userId: 'admin', // Target the admin
    },
  });

  return NextResponse.json({ 
    message: 'Infection alert processed.',
    familyMembersFound: familyMembers.length,
  });
}
