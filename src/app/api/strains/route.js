import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const STRAINS_FILE = path.join(process.cwd(), 'src', 'data', 'strains.json');

async function readStrains() {
  const data = await fs.readFile(STRAINS_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeStrains(strains) {
  await fs.writeFile(STRAINS_FILE, JSON.stringify({ strains }, null, 2));
}

export async function GET() {
  try {
    const data = await readStrains();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load strains' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const newStrain = await request.json();
    const data = await readStrains();
    
    // Generate new ID
    const maxId = Math.max(...data.strains.map(s => s.id), 0);
    newStrain.id = maxId + 1;
    
    data.strains.push(newStrain);
    await writeStrains(data.strains);
    
    return NextResponse.json({ success: true, strain: newStrain });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add strain' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const updatedStrain = await request.json();
    const data = await readStrains();
    
    const index = data.strains.findIndex(s => s.id === updatedStrain.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Strain not found' }, { status: 404 });
    }
    
    data.strains[index] = updatedStrain;
    await writeStrains(data.strains);
    
    return NextResponse.json({ success: true, strain: updatedStrain });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update strain' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    const data = await readStrains();
    const index = data.strains.findIndex(s => s.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Strain not found' }, { status: 404 });
    }
    
    data.strains.splice(index, 1);
    await writeStrains(data.strains);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete strain' }, { status: 500 });
  }
}
