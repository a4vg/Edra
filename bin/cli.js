#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { exit } from 'process';
import { detect } from 'package-manager-detector';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.join(__dirname, '../src/lib/edra');

const [, , command, type] = process.argv;

const uiOptions = ['headless', 'shadcn'];

// List of dependencies to install
const dependencies = [
	'@aarkue/tiptap-math-extension',
	'@tiptap/core',
	'@tiptap/extension-character-count',
	'@tiptap/extension-code-block-lowlight',
	'@tiptap/extension-color',
	'@tiptap/extension-highlight',
	'@tiptap/extension-image',
	'@tiptap/extension-link',
	'@tiptap/extension-placeholder',
	'@tiptap/extension-subscript',
	'@tiptap/extension-superscript',
	'@tiptap/extension-table',
	'@tiptap/extension-table-header',
	'@tiptap/extension-table-row',
	'@tiptap/extension-task-item',
	'@tiptap/extension-task-list',
	'@tiptap/extension-text',
	'@tiptap/extension-text-align',
	'@tiptap/extension-text-style',
	'@tiptap/extension-typography',
	'@tiptap/extension-underline',
	'@tiptap/pm',
	'@tiptap/starter-kit',
	'@tiptap/suggestion',
	'katex',
	'lowlight',
	'svelte-tiptap',
	'tippy.js',
	'tiptap-extension-auto-joiner',
	'tiptap-extension-global-drag-handle',
	'lucide-svelte',
	'tiptap-markdown'
];

// Install dependencies with the detected package manager
async function installDependencies() {
	const packageManager = await detect();
	let installCommand;

	if (!packageManager) {
		console.log('No package manager detected. Do not worry just install following packages');
		console.log(dependencies.join(' '));
		return;
	}

	// Construct the install command based on the package manager
	switch (packageManager.name) {
		case 'npm':
			installCommand = `npm install ${dependencies.join(' ')}`;
			break;
		case 'pnpm':
			installCommand = `pnpm add ${dependencies.join(' ')}`;
			break;
		case 'yarn':
			installCommand = `yarn add ${dependencies.join(' ')}`;
			break;
		case 'bun':
			installCommand = `bun add ${dependencies.join(' ')}`;
			break;
		case 'deno':
			installCommand = `deno install npm:${dependencies.join(' npm:')}`;
			break;
		default: // This would not happen but just in case
			console.log('No package manager detected. Do not worry just install following packages');
			console.log(dependencies.join(' '));
			break;
	}

	try {
		console.log(`Installing dependencies using ${packageManager.name}...`);
		console.log(installCommand);
		execSync(installCommand, { stdio: 'inherit' });
		console.log('Dependencies installed successfully.');
	} catch (error) {
		console.error('Error installing dependencies:', error);
	}
}

async function initHeadless(exclude) {
	const targetPath = './src/lib/components/edra';
	let items = await fs.readdir(sourcePath);
	items = items.filter((item) => item !== exclude);
	items.forEach(async (item) => {
		const newSourcePath = path.join(sourcePath, item);
		const newTargetPath = path.join(targetPath, item);
		try {
			await fs.copy(newSourcePath, newTargetPath);
			console.log(`✅ Copying "${item}" to "${newTargetPath}"`);
		} catch (e) {
			console.log(`❌ Failed to copy "${sourcePath}" to "${newTargetPath}"`);
			console.log('Error:', e);
			exit(-1);
		}
	});
}

async function init(type) {
	console.log('Setting up Edra for your project with type:', type);
	initHeadless(uiOptions.filter((item) => item !== type)[0]);
	await installDependencies();

	console.log('Find more information about Edra at https://edra.tsuzat.com/docs');
}

if (command === 'init' && uiOptions.includes(type)) {
	init(type);
} else {
	console.log(
		'Usage: edra init [headless|shadcn]. Please follow https://edra.tsuzat.com/docs for documentations.'
	);
}
