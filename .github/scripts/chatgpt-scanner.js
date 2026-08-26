#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const TYPESCRIPT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const MAX_FILE_SIZE = 10000; // chars

function getTypeScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getTypeScriptFiles(filepath, fileList);
    } else if (TYPESCRIPT_EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filepath);
    }
  });
  return fileList;
}

async function analyzeCodeWithChatGPT(code, filePath) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Analyze TypeScript/JavaScript code for errors, security issues, and improvements. Provide specific line numbers and fixes.'
        },
        {
          role: 'user',
          content: `Analyze this code for errors and improvements:\n\nFile: ${filePath}\n\n\`\`\`typescript\n${code}\n\`\`\``
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Starting ChatGPT Code Scanner...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set. Please add it to GitHub Secrets.');
    process.exit(1);
  }

  const files = getTypeScriptFiles(process.cwd());
  const tsFiles = files.filter(f => !f.includes('node_modules') && !f.includes('.git'));
  
  console.log(`📂 Found ${tsFiles.length} TypeScript files to analyze`);
  
  const results = [];
  
  for (const filePath of tsFiles.slice(0, 5)) { // Limit to first 5 files
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.length > MAX_FILE_SIZE) {
        console.log(`⏭️  Skipping ${filePath} (too large)`);
        continue;
      }

      console.log(`🔎 Analyzing ${filePath}...`);
      const analysis = await analyzeCodeWithChatGPT(content, filePath);
      
      if (analysis) {
        results.push({
          file: filePath,
          analysis: analysis
        });
        console.log(`✅ Analysis complete for ${filePath}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  }

  console.log('\n📊 Analysis Summary:');
  results.forEach(result => {
    console.log(`\n${result.file}:`);
    console.log(result.analysis);
  });

  console.log('\n✨ ChatGPT Code Scanner Complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
