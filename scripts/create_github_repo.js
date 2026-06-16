#!/usr/bin/env node
/**
 * create_github_repo.js
 * Usage: GITHUB_TOKEN=ghp_xxx node scripts/create_github_repo.js [repoName]
 * Creates a GitHub repository under the authenticated user and pushes the current repository.
 */
const { execSync } = require('child_process');

async function main() {
  const repo = process.argv[2] || 'payvora';
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN not set in environment.');
    console.error('Run: GITHUB_TOKEN=xxx node scripts/create_github_repo.js payvora');
    process.exit(1);
  }

  const headers = {
    Authorization: `token ${token}`,
    'User-Agent': 'payvora-migration-script',
    Accept: 'application/vnd.github+json',
  };

  const fetch = global.fetch || ((url, opts) => import('node-fetch').then(({ default: f }) => f(url, opts)));

  try {
    // get auth user
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) {
      const txt = await userRes.text();
      throw new Error('Failed to get user: ' + txt);
    }
    const user = await userRes.json();
    const owner = user.login;

    // create repo
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: repo, description: 'Payvora invoicing app', private: false }),
    });

    if (createRes.status === 422) {
      console.log('Repository may already exist. Continuing to push to existing repo.');
    } else if (!createRes.ok) {
      const txt = await createRes.text();
      throw new Error('Failed to create repo: ' + txt);
    } else {
      console.log('Repository created on GitHub.');
    }

    // push via HTTPS using token
    const remoteUrl = `https://x-access-token:${token}@github.com/${owner}/${repo}.git`;
    try {
      execSync(`git remote remove origin || true`, { stdio: 'inherit' });
    } catch (e) {}
    execSync(`git remote add origin ${remoteUrl}`, { stdio: 'inherit' });
    execSync(`git push --set-upstream origin main`, { stdio: 'inherit' });
    console.log('Pushed current branch to GitHub.');
    console.log(`Repo URL: https://github.com/${owner}/${repo}`);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
}

main();
