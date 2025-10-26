# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 project showcasing Nano Banana, an AI image editing tool. The project uses TypeScript, Tailwind CSS, and shadcn/ui components to build a marketing landing page.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Turbopack on 0.0.0.0
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run TypeScript compiler check and Next.js linting
- `npm run format` - Format code using Biome

### Package Manager
This project uses **npm** as the package manager.

## Code Architecture

### App Structure (Next.js App Router)
- `src/app/layout.tsx` - Root layout with Geist fonts and same-runtime script
- `src/app/page.tsx` - Main landing page with all sections
- `src/app/ClientBody.tsx` - Client-side wrapper to handle hydration

### Component System
- Uses **shadcn/ui** components with "new-york" style
- Components located in `src/components/ui/`
- Path aliases configured: `@/components`, `@/lib`, `@/hooks`
- Icons from **lucide-react**

### Styling
- **Tailwind CSS** with custom configuration
- Biome formatter configured for double quotes
- CSS variables enabled for theming
- Custom gradient themes (yellow to orange)

### Key Dependencies
- **same-runtime**: External script loaded globally for functionality
- **class-variance-authority** and **clsx**: Component styling utilities
- **tailwind-merge**: Tailwind class merging

## Code Standards

### Linting & Formatting
- **Biome** for formatting (double quotes, space indentation)
- **ESLint** with Next.js TypeScript rules
- Accessibility rules mostly disabled in configs
- No unused variables warnings

### TypeScript
- TypeScript 5.8+ with strict checking via `npm run lint`
- Path aliases configured in tsconfig.json

## External Integrations

### Assets
- Images hosted on `ext.same-assets.com` and `ugc.same-assets.com`
- Unsplash integration for demo images
- All image domains configured in next.config.js

### Deployment
- Configured for Netlify (netlify.toml present)
- Image optimization disabled for static export compatibility