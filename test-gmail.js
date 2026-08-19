const { getLatestEmail, getEmailBody } = require('./utils/gmail');

async function test() {
  try {
    const email = await getLatestEmail('alaminmia508@gmail.com');
    console.log('Got email ID:', email.id);
    
    // Dump structure
    console.log('Payload parts:', email.payload.parts?.length || 0);
    if (!email.payload.parts) {
      console.log('Main body size:', email.payload.body?.size);
    }
    
    const body = getEmailBody(email);
    console.log('Extracted HTML length:', body.length);
    console.log('Extracted body preview:', body.substring(0, 500));
    
    // Check if we can get plain text directly
    if (email.payload.parts) {
      const textPart = email.payload.parts.find(p => p.mimeType === 'text/plain');
      if (textPart && textPart.body?.data) {
        const plainText = Buffer.from(textPart.body.data, 'base64url').toString('utf8');
        console.log('Plain text preview:', plainText.substring(0, 500));
      }
    } else if (email.payload.body?.data) {
        const bodyData = Buffer.from(email.payload.body.data, 'base64url').toString('utf8');
        console.log('Root body preview:', bodyData.substring(0, 500));
    }
    
  } catch (e) {
    console.error('Error in getLatestEmail:', e.message);
  }
}

test();
