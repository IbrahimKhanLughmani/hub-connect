import { ApiError, ApiErrorKind } from '@/services/api-error';
import { simulateNetwork } from '@/services/network-simulation';
import { Community, CommunitySort } from '@/types/community';
import { PaginatedResult } from '@/types/pagination';

const PAGE_SIZE = 10;

let communities: Community[] = [
  { id: 'react-native-developers', name: 'React Native Developers', description: 'Building and shipping mobile apps with React Native.', memberCount: 15234, isJoined: true },
  { id: 'indie-game-makers', name: 'Indie Game Makers', description: 'Solo and small-team game developers sharing progress and feedback.', memberCount: 8421, isJoined: false },
  { id: 'home-coffee-roasters', name: 'Home Coffee Roasters', description: 'Roasting green beans at home, one batch at a time.', memberCount: 2310, isJoined: false },
  { id: 'urban-gardening', name: 'Urban Gardening', description: 'Growing food and flowers in small city spaces.', memberCount: 6789, isJoined: true },
  { id: 'trail-running-club', name: 'Trail Running Club', description: 'Routes, gear, and motivation for off-road runners.', memberCount: 4502, isJoined: false },
  { id: 'board-game-enthusiasts', name: 'Board Game Enthusiasts', description: 'Strategy, party, and cooperative board games of all kinds.', memberCount: 11987, isJoined: false },
  { id: 'vintage-camera-collectors', name: 'Vintage Camera Collectors', description: 'Film cameras, restoration tips, and darkroom talk.', memberCount: 1876, isJoined: false },
  { id: 'minimalist-living', name: 'Minimalist Living', description: 'Owning less and living with more intention.', memberCount: 9234, isJoined: false },
  { id: 'sourdough-bakers', name: 'Sourdough Bakers', description: 'Starters, hydration ratios, and crumb shots.', memberCount: 7345, isJoined: true },
  { id: 'amateur-astronomers', name: 'Amateur Astronomers', description: 'Stargazing, telescopes, and astrophotography.', memberCount: 3210, isJoined: false },
  { id: 'woodworking-hobbyists', name: 'Woodworking Hobbyists', description: 'Hand tools, power tools, and finished builds.', memberCount: 5643, isJoined: false },
  { id: 'language-exchange', name: 'Language Exchange', description: 'Practice new languages with native speakers.', memberCount: 12456, isJoined: false },
  { id: 'freelance-writers', name: 'Freelance Writers', description: 'Pitching, rates, and the writing life.', memberCount: 4021, isJoined: false },
  { id: 'digital-illustrators', name: 'Digital Illustrators', description: 'Process videos, critique, and brush recommendations.', memberCount: 8890, isJoined: false },
  { id: 'cycling-commuters', name: 'Cycling Commuters', description: 'Getting to work on two wheels, rain or shine.', memberCount: 3987, isJoined: false },
  { id: 'vinyl-record-collectors', name: 'Vinyl Record Collectors', description: 'Crate digging, pressings, and turntable setups.', memberCount: 6102, isJoined: false },
  { id: 'houseplant-parents', name: 'Houseplant Parents', description: 'Keeping leafy things alive indoors.', memberCount: 14320, isJoined: true },
  { id: 'budget-travelers', name: 'Budget Travelers', description: 'Seeing the world without spending a fortune.', memberCount: 10233, isJoined: false },
  { id: 'home-brewing-club', name: 'Home Brewing Club', description: 'Beer, cider, and kombucha made at home.', memberCount: 5321, isJoined: false },
  { id: 'chess-strategy', name: 'Chess Strategy', description: 'Openings, endgames, and puzzle-of-the-day.', memberCount: 9876, isJoined: false },
  { id: 'rock-climbing-crew', name: 'Rock Climbing Crew', description: 'Bouldering, sport, and trad climbing discussion.', memberCount: 4456, isJoined: false },
  { id: 'analog-photography', name: 'Analog Photography', description: 'Shooting and developing film in a digital world.', memberCount: 3654, isJoined: false },
  { id: 'tabletop-rpg-guild', name: 'Tabletop RPG Guild', description: 'Campaign planning, homebrew rules, and dice.', memberCount: 7012, isJoined: false },
  { id: 'personal-finance-nerds', name: 'Personal Finance Nerds', description: 'Budgeting, investing, and financial independence.', memberCount: 13567, isJoined: false },
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
