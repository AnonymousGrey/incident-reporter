import crypto from 'crypto'

export default function handler(req: any, res: any) {
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!privateKey) {
      return res.status(400).json({ error: 'Private key not found' })
    }

    console.log('🔑 Testing private key...')
    console.log('   Length:', privateKey.length)
    console.log('   Starts with:', privateKey.substring(0, 50))
    console.log('   Contains BEGIN:', privateKey.includes('BEGIN PRIVATE KEY'))
    console.log('   Contains END:', privateKey.includes('END PRIVATE KEY'))

    // Try to create a signer
    const signer = crypto.createSign('RSA-SHA256')
    signer.update('test message')
    const signature = signer.sign(privateKey, 'base64')

    console.log('✅ Private key is valid and can sign')
    console.log('   Signature length:', signature.length)

    res.status(200).json({
      status: 'OK',
      message: 'Private key is valid',
      keyLength: privateKey.length,
      canSign: true,
      signatureLength: signature.length,
    })
  } catch (error) {
    console.error('❌ Private key test failed:', error)
    res.status(500).json({
      error: 'Private key test failed',
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
