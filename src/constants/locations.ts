// ---------------------------------------------------------------------------
// Location master data: Campus -> Venue -> Room
// Sessions reference a Room by id; campus/building/room labels are DERIVED.
// ---------------------------------------------------------------------------

export interface Campus {
  id: string;
  code: string;
  name: string;
  country: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface Venue {
  id: string;
  campusId: string;
  code: string;
  name: string;
  /** Building / property name */
  building: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  capacity: number;
  isActive: boolean;
  isDefault: boolean;
}

export type RoomType = "Physical" | "Virtual" | "Sublet";

export interface Room {
  id: string;
  venueId: string;
  code: string;
  name: string;
  type: RoomType;
  capacity: number;
  isActive: boolean;
}

export const CAMPUSES_MASTER: Campus[] = [
  { id: "CMP-SYD", code: "SYD", name: "Sydney Campus", country: "Australia", isActive: true, isDefault: true },
  { id: "CMP-MEL", code: "MEL", name: "Melbourne Campus", country: "Australia", isActive: true, isDefault: false },
  { id: "CMP-BNE", code: "BNE", name: "Brisbane Campus", country: "Australia", isActive: true, isDefault: false },
  { id: "CMP-PER", code: "PER", name: "Perth Campus", country: "Australia", isActive: true, isDefault: false },
];

export const VENUES: Venue[] = [
  {
    id: "VEN-SYD-A", campusId: "CMP-SYD", code: "SYD-A", name: "Building A", building: "Building A",
    street: "1 Harbour St", suburb: "Haymarket", state: "NSW", postcode: "2000", country: "Australia",
    capacity: 600, isActive: true, isDefault: true,
  },
  {
    id: "VEN-SYD-C", campusId: "CMP-SYD", code: "SYD-C", name: "Building C", building: "Building C",
    street: "14 Thomas St", suburb: "Ultimo", state: "NSW", postcode: "2007", country: "Australia",
    capacity: 300, isActive: true, isDefault: false,
  },
  {
    id: "VEN-MEL-B", campusId: "CMP-MEL", code: "MEL-B", name: "Building B", building: "Building B",
    street: "222 Latrobe St", suburb: "Melbourne", state: "VIC", postcode: "3000", country: "Australia",
    capacity: 400, isActive: true, isDefault: true,
  },
  {
    id: "VEN-BNE-A", campusId: "CMP-BNE", code: "BNE-A", name: "Building A", building: "Building A",
    street: "88 Adelaide St", suburb: "Brisbane City", state: "QLD", postcode: "4000", country: "Australia",
    capacity: 350, isActive: true, isDefault: true,
  },
  {
    id: "VEN-PER-B", campusId: "CMP-PER", code: "PER-B", name: "Building B", building: "Building B",
    street: "50 St Georges Tce", suburb: "Perth", state: "WA", postcode: "6000", country: "Australia",
    capacity: 250, isActive: true, isDefault: true,
  },
];

export const ROOMS: Room[] = [
  { id: "RM-SYD-A101", venueId: "VEN-SYD-A", code: "SYD-A-101", name: "Room 101", type: "Physical", capacity: 80, isActive: true },
  { id: "RM-SYD-A201", venueId: "VEN-SYD-A", code: "SYD-A-201", name: "Room 201", type: "Physical", capacity: 120, isActive: true },
  { id: "RM-SYD-A310", venueId: "VEN-SYD-A", code: "SYD-A-310", name: "Room 310", type: "Physical", capacity: 40, isActive: true },
  { id: "RM-SYD-C100", venueId: "VEN-SYD-C", code: "SYD-C-100", name: "Room 100 (Lab)", type: "Physical", capacity: 30, isActive: true },
  { id: "RM-SYD-C205", venueId: "VEN-SYD-C", code: "SYD-C-205", name: "Room 205", type: "Sublet", capacity: 60, isActive: true },
  { id: "RM-MEL-B150", venueId: "VEN-MEL-B", code: "MEL-B-150", name: "Room 150", type: "Physical", capacity: 30, isActive: true },
  { id: "RM-MEL-B250", venueId: "VEN-MEL-B", code: "MEL-B-250", name: "Room 250", type: "Physical", capacity: 50, isActive: true },
  { id: "RM-BNE-A101", venueId: "VEN-BNE-A", code: "BNE-A-101", name: "Room 101", type: "Physical", capacity: 100, isActive: true },
  { id: "RM-BNE-A210", venueId: "VEN-BNE-A", code: "BNE-A-210", name: "Room 210", type: "Virtual", capacity: 200, isActive: true },
  { id: "RM-PER-B250", venueId: "VEN-PER-B", code: "PER-B-250", name: "Room 250", type: "Physical", capacity: 50, isActive: true },
];

// --------------------------- Lookups ---------------------------------------

export const getCampus = (id?: string) => CAMPUSES_MASTER.find((c) => c.id === id);
export const getVenue = (id?: string) => VENUES.find((v) => v.id === id);
export const getRoom = (id?: string) => ROOMS.find((r) => r.id === id);

export const getDefaultCampus = () => CAMPUSES_MASTER.find((c) => c.isDefault);

export const getVenuesForCampus = (campusId?: string): Venue[] =>
  campusId ? VENUES.filter((v) => v.campusId === campusId && v.isActive) : [];

export const getRoomsForVenue = (venueId?: string): Room[] =>
  venueId ? ROOMS.filter((r) => r.venueId === venueId && r.isActive) : [];

export interface ResolvedLocation {
  room: Room;
  venue: Venue;
  campus: Campus;
  /** e.g. "Building A" */
  buildingLabel: string;
  /** e.g. "Room 201" */
  roomLabel: string;
  /** e.g. "Building A - Room 201" */
  label: string;
  capacity: number;
}

/** Resolve a roomId to the full Room -> Venue -> Campus chain. */
export function resolveLocation(roomId?: string): ResolvedLocation | undefined {
  const room = getRoom(roomId);
  if (!room) return undefined;
  const venue = getVenue(room.venueId);
  if (!venue) return undefined;
  const campus = getCampus(venue.campusId);
  if (!campus) return undefined;
  return {
    room,
    venue,
    campus,
    buildingLabel: venue.building,
    roomLabel: room.name,
    label: `${venue.building} - ${room.name}`,
    capacity: room.capacity,
  };
}

export const getCampusNameForRoom = (roomId?: string) => resolveLocation(roomId)?.campus.name;
export const getLocationLabel = (roomId?: string) => resolveLocation(roomId)?.label;
export const getRoomCapacity = (roomId?: string) => resolveLocation(roomId)?.capacity;

// --------------------------- Validation ------------------------------------

export interface MasterDataIssue {
  entity: "campus" | "venue" | "room";
  id: string;
  message: string;
}

/** Structural rules: single default campus, venue country == campus country, unique room codes. */
export function validateLocationMasterData(
  campuses: Campus[] = CAMPUSES_MASTER,
  venues: Venue[] = VENUES,
  rooms: Room[] = ROOMS
): MasterDataIssue[] {
  const issues: MasterDataIssue[] = [];

  const defaults = campuses.filter((c) => c.isDefault);
  if (defaults.length > 1) {
    defaults.slice(1).forEach((c) =>
      issues.push({ entity: "campus", id: c.id, message: "Only one campus can be default" })
    );
  }

  const venueDefaultsByCampus = new Map<string, number>();
  venues.forEach((v) => {
    const campus = campuses.find((c) => c.id === v.campusId);
    if (!campus) {
      issues.push({ entity: "venue", id: v.id, message: `Unknown campusId ${v.campusId}` });
      return;
    }
    if (v.country !== campus.country) {
      issues.push({
        entity: "venue",
        id: v.id,
        message: `Country "${v.country}" must match parent campus country "${campus.country}"`,
      });
    }
    if (v.isDefault) {
      const n = (venueDefaultsByCampus.get(v.campusId) ?? 0) + 1;
      venueDefaultsByCampus.set(v.campusId, n);
      if (n > 1) issues.push({ entity: "venue", id: v.id, message: "Only one default venue per campus" });
    }
  });

  const seen = new Set<string>();
  rooms.forEach((r) => {
    if (!venues.some((v) => v.id === r.venueId)) {
      issues.push({ entity: "room", id: r.id, message: `Unknown venueId ${r.venueId}` });
    }
    if (seen.has(r.code)) {
      issues.push({ entity: "room", id: r.id, message: `Duplicate room code "${r.code}"` });
    }
    seen.add(r.code);
  });

  return issues;
}

if (import.meta.env?.DEV) {
  const issues = validateLocationMasterData();
  if (issues.length) {
    // eslint-disable-next-line no-console
    console.warn("[locations] master data validation issues:", issues);
  }
}

/** Campus display names — kept for filter bars that filter by campus name. */
export const CAMPUS_NAMES = CAMPUSES_MASTER.filter((c) => c.isActive).map((c) => c.name);
