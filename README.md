# Anonymous Chat API

A real-time anonymous group chat service built with NestJS, PostgreSQL, Prisma ORM, Redis, and Socket.IO.

## Overview

This is a backend API for an anonymous chat platform where users can:
- Identify with a username only (no passwords, no registration)
- Create or join chat rooms
- Send and receive messages in real-time
- Messages are persisted to PostgreSQL
- Real-time delivery via WebSocket with Redis pub/sub scaling

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching/Session**: Redis
- **Real-time**: Socket.IO
- **Language**: TypeScript

## Features

- ✅ User authentication with session tokens (stored in Redis)
- ✅ Room management (create, list, get details, delete)
- ✅ Message history with cursor-based pagination
- ✅ Real-time messaging via WebSocket
- ✅ Redis pub/sub for horizontal scaling
- ✅ Active user tracking per room
- ✅ Only room creator can delete the room

## Installation

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- Redis (v6+)

### Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd anonymous-chat-api