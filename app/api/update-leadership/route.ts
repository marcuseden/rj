/**
 * Auto-update World Bank Leadership
 * Can be called on login or manually
 * GET /api/update-leadership
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  console.log('🔄 Auto-updating World Bank leadership...');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Current verified World Bank leadership (as of Dec 2024)
    const leadership = [
      {
        name: 'Ajay Banga',
        position: 'President, World Bank Group',
        department: 'Office of the President',
        bio: 'Ajay Banga is the 14th President of the World Bank Group and leads the institution\'s efforts to end extreme poverty and boost shared prosperity on a livable planet.',
        avatar_url: '/avatars/ajay-banga.jpg',
        level: 0,
        is_active: true
      },
      {
        name: 'Axel van Trotsenburg',
        position: 'Senior Managing Director',
        department: 'Operations',
        bio: 'World Bank Senior Managing Director overseeing operations and country engagement.',
        avatar_url: '/avatars/axel-van-trotsenburg.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Anna Bjerde',
        position: 'Managing Director of Operations',
        department: 'Operations',
        bio: 'World Bank Managing Director responsible for operational delivery and client engagement.',
        avatar_url: '/avatars/anna-bjerde.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Anshula Kant',
        position: 'Managing Director and Chief Financial Officer',
        department: 'Finance',
        bio: 'World Bank Group Managing Director and Chief Financial Officer overseeing financial operations.',
        avatar_url: '/avatars/anshula-kant.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Indermit Gill',
        position: 'Chief Economist and Senior Vice President',
        department: 'Development Economics',
        bio: 'World Bank Group Chief Economist providing economic analysis and policy guidance.',
        avatar_url: '/avatars/indermit-gill.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Monique Vledder',
        position: 'Practice Manager, Global Health, Nutrition, and Population',
        department: 'Health, Nutrition and Population',
        bio: 'Practice Manager leading Global Health, Nutrition, and Population technical work, partnerships, and learning.',
        level: 2,
        is_active: true
      },
      {
        name: 'Makhtar Diop',
        position: 'Managing Director, IFC',
        department: 'IFC',
        bio: 'IFC Managing Director leading private sector development initiatives.',
        avatar_url: '/avatars/makhtar-diop.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Mamta Murthi',
        position: 'Vice President, Human Development',
        department: 'Human Development',
        bio: 'Vice President for Human Development overseeing health, education, and social protection.',
        avatar_url: '/avatars/mamta-murthi.jpg',
        level: 2,
        is_active: true
      }
    ];
    
    let updated = 0;
    let added = 0;
    const errors: string[] = [];
    
    for (const member of leadership) {
      try {
        // Check if exists
        const { data: existing } = await supabase
          .from('worldbank_orgchart')
          .select('id')
          .eq('name', member.name)
          .maybeSingle();
        
        if (existing) {
          // Update
          const { error } = await supabase
            .from('worldbank_orgchart')
            .update(member)
            .eq('id', existing.id);
          
          if (!error) {
            updated++;
            console.log(`✅ Updated: ${member.name}`);
          } else {
            errors.push(`Update failed for ${member.name}: ${error.message}`);
          }
        } else {
          // Insert
          const { error } = await supabase
            .from('worldbank_orgchart')
            .insert(member);
          
          if (!error) {
            added++;
            console.log(`✨ Added: ${member.name}`);
          } else {
            errors.push(`Insert failed for ${member.name}: ${error.message}`);
          }
        }
      } catch (err: any) {
        errors.push(`Error processing ${member.name}: ${err.message}`);
      }
    }
    
    const result = {
      success: true,
      updated,
      added,
      total: leadership.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n✅ Leadership update complete:', result);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ Failed to update leadership:', error);
    return NextResponse.json(
      { error: 'Failed to update leadership', details: error.message },
      { status: 500 }
    );
  }
}

