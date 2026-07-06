import { ApiError, ApiErrorKind } from '@/services/api-error';
import { simulateNetwork } from '@/services/network-simulation';
import { Community, CommunitySort } from '@/types/community';
import { PaginatedResult } from '@/types/pagination';

const PAGE_SIZE = 10;

let communities: Community[] = [
  { id: 'downtown-dubai', name: 'Downtown Dubai', description: 'Home to Burj Khalifa and The Dubai Mall, at the heart of the city.', memberCount: 18234, isJoined: true },
  { id: 'dubai-marina', name: 'Dubai Marina', description: 'A vibrant waterfront community with marina views, dining, and nightlife.', memberCount: 16789, isJoined: false },
  { id: 'arabian-ranches', name: 'Arabian Ranches', description: 'A desert-themed community of villas set around golf and polo greens.', memberCount: 9421, isJoined: true },
  { id: 'arabian-ranches-2', name: 'Arabian Ranches 2', description: 'Family villas surrounded by parks, lakes, and community centres.', memberCount: 7345, isJoined: false },
  { id: 'arabian-ranches-3', name: 'Arabian Ranches 3', description: 'The newest phase of villas with resort-style clubhouse amenities.', memberCount: 5102, isJoined: false },
  { id: 'dubai-hills-estate', name: 'Dubai Hills Estate', description: 'A green oasis built around an 18-hole championship golf course.', memberCount: 14320, isJoined: true },
  { id: 'emirates-hills', name: 'Emirates Hills', description: 'Dubai’s most prestigious address for landmark luxury villas.', memberCount: 2310, isJoined: false },
  { id: 'the-springs', name: 'The Springs', description: 'Townhouses set around lakes and landscaped walking trails.', memberCount: 8234, isJoined: false },
  { id: 'the-meadows', name: 'The Meadows', description: 'Villas surrounded by lush greenery, lakes, and quiet cul-de-sacs.', memberCount: 6789, isJoined: false },
  { id: 'the-lakes', name: 'The Lakes', description: 'Lakeside villas with mature landscaping and community parks.', memberCount: 5643, isJoined: false },
  { id: 'the-greens', name: 'The Greens', description: 'Low-rise apartments set among parks, lakes, and shaded courtyards.', memberCount: 7890, isJoined: false },
  { id: 'the-views', name: 'The Views', description: 'Apartments overlooking golf courses and landscaped lakes.', memberCount: 4502, isJoined: false },
  { id: 'business-bay', name: 'Business Bay', description: 'A dynamic business and residential district along the Dubai Water Canal.', memberCount: 12456, isJoined: false },
  { id: 'dubai-creek-harbour', name: 'Dubai Creek Harbour', description: 'A rising waterfront community along the historic Dubai Creek.', memberCount: 9876, isJoined: true },
  { id: 'the-valley', name: 'The Valley', description: 'A family-first community centred on nature, trails, and open space.', memberCount: 3654, isJoined: false },
  { id: 'emaar-south', name: 'Emaar South', description: 'A golf-course community close to Al Maktoum International Airport.', memberCount: 4021, isJoined: false },
  { id: 'reem', name: 'Reem', description: 'Townhouses and villas within Arabian Ranches 3, close to central parks.', memberCount: 3987, isJoined: false },
  { id: 'mudon', name: 'Mudon', description: 'Townhouses and villas built around a central park and cycling trails.', memberCount: 6102, isJoined: false },
  { id: 'dubailand', name: 'Dubailand', description: 'A large-scale community with entertainment, leisure, and retail nearby.', memberCount: 11987, isJoined: false },
  { id: 'rashid-yachts-marina', name: 'Rashid Yachts & Marina', description: 'A new waterfront marina community in Dubai Maritime City.', memberCount: 1876, isJoined: false },
  { id: 'address-downtown-residences', name: 'Address Downtown Residences', description: 'Branded residences just steps from Burj Khalifa and Dubai Opera.', memberCount: 3210, isJoined: false },
  { id: 'park-ridge', name: 'Park Ridge', description: 'Apartments in Dubai Hills Estate overlooking the central park.', memberCount: 5321, isJoined: false },
  { id: 'golf-views', name: 'Golf Views', description: 'Apartments overlooking the Dubai Hills championship golf course.', memberCount: 4456, isJoined: false },
  { id: 'maple', name: 'Maple', description: 'Villas in Dubai Hills Estate designed around family living.', memberCount: 9234, isJoined: false },
];

export async function fetchCommunities(params: {
  page: number;
  search?: string;
  sort?: CommunitySort;
}): Promise<PaginatedResult<Community>> {
  await simulateNetwork(600);

  const search = params.search?.trim().toLowerCase();
  const filtered = search
    ? communities.filter(
        (community) =>
          community.name.toLowerCase().includes(search) ||
          community.description.toLowerCase().includes(search)
      )
    : communities;

  const sorted = [...filtered].sort((a, b) =>
    params.sort === CommunitySort.MembersDesc
      ? b.memberCount - a.memberCount
      : a.name.localeCompare(b.name)
  );

  const start = (params.page - 1) * PAGE_SIZE;
  const items = sorted.slice(start, start + PAGE_SIZE);
  const hasNextPage = start + PAGE_SIZE < sorted.length;

  return {
    items,
    nextPage: hasNextPage ? params.page + 1 : null,
    totalCount: sorted.length,
  };
}

export async function fetchCommunity(id: string): Promise<Community> {
  await simulateNetwork(500);

  const community = communities.find((item) => item.id === id);
  if (!community) {
    throw new ApiError(ApiErrorKind.NotFound, `Community "${id}" not found`);
  }

  return { ...community };
}

export async function joinCommunity(id: string): Promise<Community> {
  await simulateNetwork(400);

  const community = communities.find((item) => item.id === id);
  if (!community) {
    throw new ApiError(ApiErrorKind.NotFound, `Community "${id}" not found`);
  }

  community.isJoined = true;
  community.memberCount += 1;

  return { ...community };
}

export async function leaveCommunity(id: string): Promise<Community> {
  await simulateNetwork(400);

  const community = communities.find((item) => item.id === id);
  if (!community) {
    throw new ApiError(ApiErrorKind.NotFound, `Community "${id}" not found`);
  }

  community.isJoined = false;
  community.memberCount = Math.max(0, community.memberCount - 1);

  return { ...community };
}
