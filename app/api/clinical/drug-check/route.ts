import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { medication, patientId } = await request.json();

  // In a real app, you would fetch the patient's current medications
  // from their record using the patientId.
  const currentMedications = ['Lisinopril', 'Metformin']; // Mock data

  // Mock Drug-Drug Interaction Check
  const interactions = currentMedications.includes('Lisinopril') && medication.toLowerCase().includes('ibuprofen')
    ? ['Ibuprofen may decrease the effectiveness of Lisinopril.']
    : [];

  // Query the KnowledgeBase for cheaper, localized generic alternatives.
  // This simulates a vector search on the `content` field.
  const genericAlternatives = await prisma.knowledgeBase.findMany({
    where: {
      content: {
        contains: medication,
      },
      fileType: 'drug_generic',
    },
  });

  return NextResponse.json({
    interactions,
    genericAlternatives,
  });
}
