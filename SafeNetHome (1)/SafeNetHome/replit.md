# Overview

This is a full-stack Router Control Panel application built with React and Express.js that provides a web-based interface for managing network routers. The application allows users to monitor connected devices, manage security settings, configure parental controls, and adjust network settings through an intuitive dashboard interface.

The system is designed as a modern single-page application with real-time updates via WebSocket connections, comprehensive device management capabilities, and a polished UI built with shadcn/ui components.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **Real-time Updates**: Custom WebSocket hook for live data synchronization
- **Theme Support**: Built-in light/dark theme provider with system preference detection

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Real-time Communication**: WebSocket server for broadcasting live updates to connected clients
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

## Data Storage
- **Primary Database**: PostgreSQL via Neon Database serverless platform
- **ORM**: Drizzle ORM with type-safe schema definitions and migrations
- **Schema Design**: Relational tables for devices, security events, parental profiles, network settings, and port forwarding rules
- **Development Storage**: In-memory storage implementation for local development and testing

## API Design
- **Architecture**: RESTful API with conventional HTTP methods
- **Real-time Updates**: WebSocket connections for broadcasting changes to all connected clients
- **Data Validation**: Zod schemas for runtime validation of API inputs and outputs
- **Error Handling**: Centralized error handling middleware with structured error responses

## Key Features
- **Device Management**: Monitor and control network-connected devices with bandwidth tracking and blocking capabilities
- **Security Monitoring**: Track security events with severity levels and read/unread status management
- **Parental Controls**: Create and manage profiles with time limits, content filtering, and access restrictions
- **Network Configuration**: Manage WiFi settings, guest networks, firewall, and port forwarding rules
- **Real-time Dashboard**: Live updates of network statistics, device status, and security alerts

# External Dependencies

## Database & Storage
- **Neon Database**: Serverless PostgreSQL database hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with schema migrations and query building

## UI & Styling
- **Radix UI**: Accessible, unstyled UI primitives for building the component library
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming
- **Lucide React**: Icon library providing consistent iconography throughout the application

## Development & Build Tools
- **Vite**: Fast build tool with hot module replacement and optimized production builds
- **TypeScript**: Static type checking for improved developer experience and code reliability
- **ESBuild**: Fast JavaScript bundler used by Vite for production builds

## State Management & HTTP
- **TanStack Query**: Server state management with caching, background updates, and optimistic mutations
- **Wouter**: Lightweight client-side routing library
- **WebSocket**: Native WebSocket implementation for real-time bidirectional communication

## Validation & Utilities
- **Zod**: TypeScript-first schema validation for API contracts and data integrity
- **date-fns**: Modern date utility library for timestamp formatting and manipulation
- **class-variance-authority**: Utility for building type-safe CSS class variants