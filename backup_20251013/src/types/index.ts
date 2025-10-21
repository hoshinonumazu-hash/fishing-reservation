export type Boat = {
  id: number;
  name: string;
  ownerName: string;
  contact: string;
  homepageUrl?: string;
};

export type FishingPlan = {
  id: number;
  boatId: number;
  title: string;
  description: string;
  area: string;
  fishTypes: string[];
  price: number;
  maxCapacity: number;
  departureTime: string;
  returnTime: string;
  meetingPlace: string;
  imageUrl?: string;
  weekday: string;
};
