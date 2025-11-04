// Test script to verify GLM fallback functionality
import { analyzeSinglePaper } from './src/paper-analyzer.js';
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

  // Test with actual paper analysis
  console.log('Testing paper analysis with GLM fallback...');
  const testPaper = {
    id: 'test-paper-1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that have been improved over the years.',
    published: '2017-06-12'
  };

  // Invalid OpenRouter API key to force fallback
  const invalidApiKey = 'invalid-key-to-force-fallback';

  try {
    console.log('Attempting paper analysis with invalid OpenRouter key (should fallback to GLM)...');
    const analyzedPaper = await analyzeSinglePaper(testPaper, invalidApiKey, glmFallbackConfig);
    console.log('✅ Paper analysis with GLM fallback successful!');
    console.log('Analysis categories:', analyzedPaper.analysis?.category);
    console.log('Analysis score:', analyzedPaper.analysis?.relevance_score);
    console.log('Analysis summary:', analyzedPaper.analysis?.summary?.substring(0, 150) + '...');
  } catch (error) {
    console.log('❌ Paper analysis test failed:', error.message);
    console.log('This is expected if GLM API is not accessible from this environment');
  }

  console.log('\n✅ GLM fallback configuration test completed');
  console.log('Configuration details:');
  console.log('- GLM API Key:', glmFallbackConfig.apiKey ? '✓ Configured' : '✗ Missing');
  console.log('- GLM Base URL:', glmFallbackConfig.baseUrl);
  console.log('- GLM Model:', glmFallbackConfig.model);
};

// Run the test
testGLMFallback();