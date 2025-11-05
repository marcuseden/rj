/**
 * Verify API endpoints work after database migration
 */

async function verifyAPI() {
  const baseUrl = 'http://localhost:3001';

  console.log('🔍 Verifying API endpoints...');

  try {
    // Test worldbank-orgchart API
    console.log('\n📊 Testing worldbank-orgchart API...');
    const orgChartResponse = await fetch(`${baseUrl}/api/worldbank-orgchart?action=hierarchy`);
    const orgChartData = await orgChartResponse.json();

    if (orgChartResponse.ok && orgChartData.hierarchy) {
      console.log('✅ World Bank org chart API working');
      console.log(`   Found ${orgChartData.hierarchy.length} members in hierarchy`);
    } else {
      console.log('❌ World Bank org chart API failed:', orgChartData.error);
    }

    // Test worldbank-search API
    console.log('\n🔍 Testing worldbank-search API...');
    const searchResponse = await fetch(`${baseUrl}/api/worldbank-search?q=climate&limit=5`);
    const searchData = await searchResponse.json();

    if (searchResponse.ok) {
      console.log('✅ World Bank search API working');
      console.log(`   Found ${searchData.total} documents for "climate" search`);
    } else {
      console.log('❌ World Bank search API failed:', searchData.error);
    }

    // Test analyze-speech API (basic check)
    console.log('\n🎤 Testing analyze-speech API...');
    const speechResponse = await fetch(`${baseUrl}/api/analyze-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userSpeech: 'Hello world' })
    });
    const speechData = await speechResponse.json();

    if (speechResponse.ok) {
      console.log('✅ Speech analysis API working');
    } else {
      console.log('❌ Speech analysis API failed:', speechData.error);
    }

    // Test rj-writing-analysis API
    console.log('\n✍️ Testing RJ writing analysis API...');
    const writingResponse = await fetch(`${baseUrl}/api/rj-writing-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'This is a test about development and partnership.' })
    });
    const writingData = await writingResponse.json();

    if (writingResponse.ok) {
      console.log('✅ RJ writing analysis API working');
      console.log(`   Analysis score: ${writingData.overallScore}/100`);
    } else {
      console.log('❌ RJ writing analysis API failed:', writingData.error);
    }

    console.log('\n🎉 API verification complete!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyAPI();

