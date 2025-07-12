# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DrawScale is a system design interview preparation tool. The project is currently in its initial setup phase.

## Project Status

This is a newly initialized repository with no implementation yet. The project structure suggests it will be a JavaScript/TypeScript application based on the comprehensive Node.js .gitignore file.

## Development Setup

As the project is not yet implemented, standard commands are not available. When implementing this project, consider:

1. Initialize with `npm init` or `yarn init` to create package.json
2. Set up TypeScript if needed with `npx tsc --init`
3. Install a web framework appropriate for an interview prep tool (React, Vue, Next.js, etc.)
4. Set up testing framework (Jest, Vitest, etc.)
5. Configure linting and formatting tools (ESLint, Prettier)

## Expected Architecture

Based on the project description as a "system design interview prep tool", consider implementing:

- **Frontend**: Interactive UI for system design diagramming and practice
- **Components**: Drawing tools, component library for system design elements
- **Data**: Storage for interview questions, design patterns, and user progress
- **Features**: Drawing canvas, system design templates, practice problems

## Git Configuration

The repository includes a comprehensive .gitignore file configured for Node.js projects, including:
- Node modules and package manager files
- Environment variables
- Build outputs
- Testing and coverage reports
- Framework-specific files (Next.js, Nuxt, Vue, Svelte, Gatsby)