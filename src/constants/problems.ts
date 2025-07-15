import { SystemDesignProblem, DifficultyLevel } from '../types/problem';

export const DEFAULT_PROBLEM: SystemDesignProblem = {
  id: 'bitly-design',
  title: 'Design Bitly',
  description: 'A simple test problem for the system design tool',
  difficulty: DifficultyLevel.MEDIUM,
  content: `# Design Bitly

Design a URL shortening service like Bitly that can:

1. **Shorten URLs**: Take a long URL and return a short, unique URL
2. **Redirect**: When users click the short URL, redirect them to the original URL
3. **Analytics**: Track click counts and other metrics
4. **Custom aliases**: Allow users to create custom short URLs

## Key Requirements

- Handle millions of URLs per day
- Low latency for redirects (< 100ms)
- High availability (99.9% uptime)
- URL expiration support
- Rate limiting to prevent abuse

## System Components

Consider these components in your design:
- Load balancers
- Web servers
- Databases for URL storage
- Caching layer
- Analytics system`,
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
  description: 'System to orchestrate parking garage valets and customers.',
  difficulty: DifficultyLevel.MEDIUM,
  content: `Design a parking garage valet system. The system should help garage valet
employees by telling them where to park cars as they come in, and it should help customers
by giving them a ticket that entitles them to claim their car. It should also provide a
website so that customers can see how full a garage is ahead of time. In your design,
include details on what all the components of the system are.`,
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

export const PROBLEMS: SystemDesignProblem[] = [
  DEFAULT_PROBLEM,
  PARKING_GARAGE_VALET,
]
