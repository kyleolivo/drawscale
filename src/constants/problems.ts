import { SystemDesignProblem, DifficultyLevel } from '../types/problem';

export const BITLY_PROBLEM: SystemDesignProblem = {
  id: 'bitly-design',
  title: 'Bitly',
  description: 'URL shortening service that converts long URLs into short, shareable links.',
  difficulty: DifficultyLevel.HARD,
  content: `# Design Bitly

Design a URL shortening service like Bitly. Users can paste a long URL and get back a short URL (like bit.ly/abc123) that redirects to the original link when clicked. The service should track click analytics and handle millions of URLs daily.

## Core Features
- Shorten long URLs into unique short codes
- Redirect short URLs to original destinations
- Track click counts and basic analytics
- Support custom aliases for branded links
- Handle URL expiration and cleanup`,
  judgementCriteria: `Look for the following in the candidate's design:

**Core System Design:**
- Database schema for URL mappings (long URL -> short URL)
- URL encoding/hashing strategy (base62, MD5, custom algorithm)
- API design for shortening and redirecting
- Caching strategy for popular URLs

**Scalability Considerations:**
- Database sharding/partitioning strategy
- Load balancing approach
- CDN usage for global distribution
- Handling hot spots (viral URLs)

**Data Storage:**
- SQL vs NoSQL database choice and justification
- Read-heavy vs write-heavy optimization
- Analytics data storage (time series data)

**Additional Features:**
- Custom alias handling and collision detection
- Rate limiting implementation
- URL expiration and cleanup
- Security considerations (malicious URLs, validation)`
}; 

export const PARKING_GARAGE_VALET: SystemDesignProblem = {
  id: 'parking-garage-valet',
  title: 'Parking Garage Valet',
  description: 'Smart parking system that manages valet operations and customer experience.',
  difficulty: DifficultyLevel.MEDIUM,
  content: `# Design Parking Garage Valet

Design a parking garage valet system. Customers drop off their cars and receive a ticket to claim them later. Valets are guided to optimal parking spots. A public website shows real-time garage capacity to help customers plan their visits.

## Core Features
- Issue claim tickets to customers upon car drop-off
- Guide valets to available parking spots efficiently
- Track vehicle locations and customer information
- Provide real-time capacity information via website
- Handle car retrieval and payment processing`,
  judgementCriteria: `This question can go a variety of ways. I expect at a minimum,
the following, and either expect the candidate to bring them up (deals with ambiguity),
or will probe for answers:

- How is the logic of the system distributed? Code running embedded on each parking gate? A single service in the cloud? Both?
- What are the important APIs needed?
- How is the data stored?
- If there's a database, what might be the physical and logical data models?
  - How do we represent the spots in the garage? The spots? The tickets that have been handed out? The vehicles?
  - Related: What information is on the ticket?
- Ops: How do we know the system is healthy?

For an SDE 3 bar, I expect the following additional topics to be discussed:

- Concurrency; how will we manage multiple garages/entrances at the same time, particularly around picking an available spot
- Fault tolerance of the system, offline recovery. Do we still make money if the system goes offline? How?
- Security and confidentiality of the data. What information is on the ticket?`
}

export const CHAT_APPLICATION: SystemDesignProblem = {
  id: 'chat-application',
  title: 'WhatsApp',
  description: 'Real-time messaging app supporting one-on-one and group conversations.',
  difficulty: DifficultyLevel.HARD,
  content: `# Design WhatsApp

Design a real-time messaging application like WhatsApp. Users can send text messages, images, and files to individuals or groups. Messages are delivered instantly when recipients are online and stored for offline users to receive when they reconnect.

## Core Features
- Send and receive text messages in real-time
- Support for image and file sharing
- One-on-one and group chat conversations
- Message delivery and read status indicators
- Offline message storage and synchronization
- User authentication and contact management`,
  judgementCriteria: `Look for the following in the candidate's design:

**Real-time Communication:**
- WebSocket connections for instant messaging
- Message queuing and delivery guarantees
- Handling offline users and message persistence
- Push notifications for mobile devices

**Scalability Considerations:**
- Connection management at scale
- Database partitioning for chat history
- Load balancing for WebSocket connections
- Media file storage and CDN distribution

**Data Models:**
- User and contact relationships
- Chat room and group management
- Message schema and indexing strategy
- Delivery status tracking

**Additional Features:**
- End-to-end encryption considerations
- Message search functionality
- Spam and abuse prevention
- Cross-platform synchronization`
};

export const VIDEO_STREAMING: SystemDesignProblem = {
  id: 'video-streaming',
  title: 'YouTube',
  description: 'Video sharing platform where users upload, stream, and discover content.',
  difficulty: DifficultyLevel.HARD,
  content: `# Design YouTube

Design a video streaming platform like YouTube. Content creators upload videos which are processed and made available for viewers to watch. Users can search for videos, subscribe to channels, and interact through likes and comments.

## Core Features
- Upload and process video content in multiple formats
- Stream videos with adaptive quality based on bandwidth
- Search and discovery of video content
- User subscriptions and personalized recommendations
- Comments and engagement features
- Analytics for creators and platform`,
  judgementCriteria: `Look for the following in the candidate's design:

**Video Processing:**
- Video encoding and transcoding pipeline
- Multiple quality/resolution support
- Thumbnail generation and preview
- Storage optimization for large files

**Streaming Infrastructure:**
- CDN strategy for global content delivery
- Adaptive bitrate streaming
- Caching strategies for popular content
- Bandwidth optimization techniques

**Scalability Considerations:**
- Massive storage requirements
- Read-heavy workload optimization
- Search indexing at scale
- Recommendation algorithm infrastructure

**Additional Features:**
- Content moderation and copyright protection
- Monetization and ad serving
- Live streaming capabilities
- Mobile app synchronization`
};

export const RIDE_SHARING: SystemDesignProblem = {
  id: 'ride-sharing',
  title: 'Uber',
  description: 'Location-based ride sharing service that matches drivers with passengers.',
  difficulty: DifficultyLevel.HARD,
  content: `# Design Uber

Design a ride sharing service like Uber. Passengers request rides through a mobile app and are matched with nearby drivers. The system tracks real-time locations, calculates routes and pricing, and handles payments automatically.

## Core Features
- Match passengers with nearby available drivers
- Real-time location tracking and route navigation
- Dynamic pricing based on demand and supply
- In-app payment processing and trip billing
- Rating system for drivers and passengers
- Trip history and receipt management`,
  judgementCriteria: `Look for the following in the candidate's design:

**Location Services:**
- Real-time GPS tracking and updates
- Geospatial indexing for driver-passenger matching
- Route calculation and optimization
- Location privacy and data handling

**Matching Algorithm:**
- Driver availability and proximity
- Passenger wait time minimization
- Supply and demand balancing
- Surge pricing implementation

**Scalability Considerations:**
- High-frequency location updates
- Global service across multiple cities
- Payment processing at scale
- Real-time notification systems

**Additional Features:**
- Driver background checks and onboarding
- Trip safety features and emergency contacts
- Multi-modal transportation options
- Fraud detection and prevention`
};

export const BLOG_PLATFORM: SystemDesignProblem = {
  id: 'blog-platform',
  title: 'Blog Platform',
  description: 'Simple blogging platform where users create accounts and publish articles.',
  difficulty: DifficultyLevel.EASY,
  content: `# Design a Blog Platform

Design a simple blogging platform like Medium (basic version). Users can create accounts, write blog posts, and read articles from other users. The system should support basic user authentication and simple content management.

## Core Features
- User registration and authentication
- Create, edit, and delete blog posts
- Browse and read articles from other users
- Basic user profiles with published articles
- Simple search functionality for articles
- Comment system for reader engagement`,
  judgementCriteria: `Look for the following in the candidate's design:

**Basic System Components:**
- User authentication and session management
- Database design for users, posts, and comments
- Simple API design for CRUD operations
- Basic web server architecture

**Data Models:**
- User schema (username, email, password)
- Blog post schema (title, content, author, timestamp)
- Comment relationships and basic moderation

**Core Functionality:**
- Registration and login flow
- Content creation and editing interface
- Basic security considerations (password hashing, input validation)
- Simple pagination for article lists

**Bonus Considerations:**
- Basic caching for popular articles
- Image upload for blog posts
- Email notifications for comments
- Simple analytics (view counts)`
};

// Export the default problem for backwards compatibility
export const DEFAULT_PROBLEM = BLOG_PLATFORM;

export const PROBLEMS: SystemDesignProblem[] = [
  // Easy
  BLOG_PLATFORM,
  
  // Medium
  PARKING_GARAGE_VALET,
  
  // Hard
  BITLY_PROBLEM,
  CHAT_APPLICATION,
  VIDEO_STREAMING,
  RIDE_SHARING,
]
