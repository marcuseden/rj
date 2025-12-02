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
    
    // LATEST World Bank leadership (verified December 2025)
    // Source: https://www.worldbank.org/en/about/leadership/managers
    const leadership = [
      // Level 0: President
      {
        name: 'Ajay Banga',
        position: 'President, World Bank Group',
        department: 'Office of the President',
        bio: 'Ajay Banga is the 14th President of the World Bank Group (since June 2, 2023) and leads the institution\'s efforts to end extreme poverty and boost shared prosperity on a livable planet.',
        avatar_url: '/avatars/ajay-banga.jpg',
        level: 0,
        is_active: true
      },
      
      // Level 1: Managing Directors & Senior Leadership
      {
        name: 'Axel van Trotsenburg',
        position: 'Senior Managing Director',
        department: 'Development Policy and Partnerships',
        bio: 'Senior Managing Director responsible for Development Policy and Partnerships.',
        avatar_url: '/avatars/axel-van-trotsenburg.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Anna Bjerde',
        position: 'Managing Director of Operations',
        department: 'Operations',
        bio: 'Managing Director overseeing the World Bank\'s operational portfolio and country engagement.',
        avatar_url: '/avatars/anna-bjerde.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Anshula Kant',
        position: 'Managing Director and Chief Financial Officer',
        department: 'Finance',
        bio: 'Managing Director and Chief Financial Officer overseeing financial operations (since October 2019).',
        avatar_url: '/avatars/anshula-kant.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Wencai Zhang',
        position: 'Managing Director and Chief Administrative Officer',
        department: 'Administration',
        bio: 'Managing Director and Chief Administrative Officer (since March 2024).',
        level: 1,
        is_active: true
      },
      {
        name: 'Indermit Gill',
        position: 'Senior Vice President and Chief Economist',
        department: 'Development Economics',
        bio: 'Chief Economist providing economic analysis and policy guidance for development.',
        avatar_url: '/avatars/indermit-gill.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Christopher Stephens',
        position: 'Senior Vice President and General Counsel',
        department: 'Legal',
        bio: 'Senior Vice President and General Counsel overseeing legal affairs.',
        avatar_url: '/avatars/christopher-stephens.jpg',
        level: 1,
        is_active: true
      },
      {
        name: 'Makhtar Diop',
        position: 'Managing Director, IFC',
        department: 'IFC (International Finance Corporation)',
        bio: 'IFC Managing Director leading private sector development initiatives.',
        avatar_url: '/avatars/makhtar-diop.jpg',
        level: 1,
        is_active: true
      },
      
      // Level 2: Vice Presidents & Practice Managers
      {
        name: 'Monique Vledder',
        position: 'Practice Manager, Global Health, Nutrition, and Population',
        department: 'Health, Nutrition and Population',
        bio: 'Practice Manager leading Global Health, Nutrition, and Population technical assistance, partnerships, and learning on service delivery, climate and health, and pandemic preparedness.',
        level: 2,
        is_active: true
      },
      {
        name: 'Lisa Rosen',
        position: 'Vice President, Ethics & Internal Justice Services',
        department: 'Ethics and Compliance',
        bio: 'Vice President overseeing ethics and internal justice services.',
        level: 2,
        is_active: true
      },
      {
        name: 'Ndiamé Diop',
        position: 'Vice President, Eastern and Southern Africa',
        department: 'Eastern and Southern Africa',
        bio: 'Regional Vice President for Eastern and Southern Africa.',
        level: 2,
        is_active: true
      },
      {
        name: 'Ousmane Diagana',
        position: 'Vice President, Western and Central Africa',
        department: 'Western and Central Africa',
        bio: 'Regional Vice President for Western and Central Africa.',
        level: 2,
        is_active: true
      },
      {
        name: 'Martin Raiser',
        position: 'Vice President, South Asia',
        department: 'South Asia',
        bio: 'Regional Vice President for South Asia.',
        level: 2,
        is_active: true
      },
      {
        name: 'Carlos Felipe Jaramillo',
        position: 'Vice President, Latin America and Caribbean',
        department: 'Latin America and Caribbean',
        bio: 'Regional Vice President for Latin America and Caribbean.',
        level: 2,
        is_active: true
      },
      {
        name: 'Ousmane Dione',
        position: 'Vice President, Middle East and North Africa',
        department: 'Middle East and North Africa',
        bio: 'Regional Vice President for Middle East and North Africa.',
        level: 2,
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

