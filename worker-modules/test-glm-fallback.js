// Test script to verify GLM fallback functionality
import { callLLM, analyzeSinglePaper } from './src/paper-analyzer.js';
import { getGLMFallbackConfig } from './src/config.js';

const testGLMFallback = async () => {
  console.log('Testing GLM fallback mechanism...');

  // Mock environment variables
  const mockEnv = {
    GLM_API_KEY: '05ee2930163cef3b10b896a7a8df4c73.JBsGfDATjLorDMv0',
    GLM_BASE_URL: 'https://open.bigmodel.cn/api/paas/v4/',
    GLM_MODEL: 'glm-4-air'
  };

  const glmFallbackConfig = getGLMFallbackConfig(mockEnv);

  const testPrompt = 'Analyze this research paper title: "Attention Is All You"';
  const testModel = 'openai/gpt-5-mini';
  const testParams = {
    temperature: 0.3,
    max_tokens: 200,
    response_format: 'json_object'
  };

  // Invalid OpenRouter API key to force fallback
  const invalidApiKey = 'invalid-key-to-force-fallback';

  try {
    console.log('Attempting to call LLM with invalid OpenRouter key (should fallback to GLM)...');
    const result = await callLLM(testPrompt, testModel, testParams, invalidApiKey, glmFallbackConfig);
    console.log('✅ GLM fallback successful!');
    console.log('Result:', result.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // Test with actual paper analysis
  console.log('\nTesting paper analysis with fallback...');
  const testPaper = {
    id: 'test-paper-1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.',
    published: '2017-06-12'
  };

  try {
    const analyzedPaper = await analyzeSinglePaper(testPaper, invalidApiKey, glmFallbackConfig);
    console.log('✅ Paper analysis with GLM fallback successful!');
    console.log('Analysis summary:', analyzedPaper.analysis?.summary?.substring(0, 150) + '...');
  } catch (error) {
    console.log('❌ Paper analysis test failed:', error.message);
  }
};

// Run the test
testGLMFallback();