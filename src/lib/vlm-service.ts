// VLM Service using z-ai-web-dev-sdk

import AI from 'z-ai-web-dev-sdk'

export async function vlmAnalyze(base64Image: string, prompt: string): Promise<string> {
  try {
    // Initialize AI SDK
    const ai = new AI({
      apiKey: process.env.Z_AI_API_KEY || '',
    })

    // Check if VLM is available
    if (!ai.vlm) {
      throw new Error('VLM service is not available')
    }

    // Call VLM for image analysis
    const response = await ai.vlm.analyze({
      image: base64Image,
      prompt: prompt,
    })

    return response.text || ''
  } catch (error) {
    console.error('VLM Service Error:', error)
    throw new Error('Failed to analyze image with VLM')
  }
}
