import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FractionalizationSettings {
    pricePerUnit: number;
    totalUnits: bigint;
    unitsSold: bigint;
}
export type Time = bigint;
export interface Donation {
    id: bigint;
    donorName: string;
    campaignId: bigint;
    timestamp: Time;
    amount: number;
}
export interface Campaign {
    id: bigint;
    organizerBio: string;
    title: string;
    goalAmount: number;
    active: boolean;
    startAt: Time;
    tags: Array<string>;
    organizerName: string;
    endAt: Time;
    imageUrl: string;
    shortDescription: string;
    category: string;
    fullDescription: string;
    contributors: bigint;
    amountRaised: number;
}
export interface Gift {
    id: bigint;
    campaignId: bigint;
    description: string;
    timestamp: Time;
    itemName: string;
    contactEmail: string;
    estimatedValue: number;
}
export interface UnitClaim {
    claimantName: string;
    campaignId: bigint;
    timestamp: Time;
    unitsClaimed: bigint;
}
export interface Volunteer {
    id: bigint;
    campaignId: bigint;
    fullName: string;
    email: string;
    availability: Array<string>;
    timestamp: Time;
    skills: string;
}
export interface IncomeEntry {
    id: bigint;
    ref: string;
    source: string;
    date: string;
    createdAt: Time;
    description: string;
    category: string;
    amount: number;
}
export interface Proposal {
    id: bigint;
    status: string;
    title: string;
    votesAgainst: bigint;
    votesFor: bigint;
    createdAt: Time;
    description: string;
    votesAbstain: bigint;
    closingDate: string;
    category: string;
    proposedBy: string;
}
export interface ExpenseEntry {
    id: bigint;
    ref: string;
    date: string;
    createdAt: Time;
    description: string;
    vendor: string;
    category: string;
    amount: number;
}
export interface backendInterface {
    addExpenseEntry(date: string, ref: string, description: string, category: string, vendor: string, amount: number): Promise<ExpenseEntry>;
    addIncomeEntry(date: string, ref: string, description: string, category: string, source: string, amount: number): Promise<IncomeEntry>;
    allCampaigns(): Promise<Array<Campaign>>;
    claimUnits(campaignId: bigint, claimantName: string, units: bigint): Promise<boolean>;
    createCampaign(title: string, shortDescription: string, fullDescription: string, category: string, goalAmount: number, organizerName: string, organizerBio: string, imageUrl: string, startAt: Time, endAt: Time, tags: Array<string>): Promise<Campaign>;
    createProposal(title: string, description: string, proposedBy: string, category: string, closingDate: string): Promise<Proposal>;
    getActiveCampaigns(): Promise<Array<Campaign>>;
    getAllExpenseEntries(): Promise<Array<ExpenseEntry>>;
    getAllFractionalizationSettings(): Promise<Array<[bigint, FractionalizationSettings]>>;
    getAllIncomeEntries(): Promise<Array<IncomeEntry>>;
    getAllProposals(): Promise<Array<Proposal>>;
    getBudgetTargets(): Promise<Array<[string, number]>>;
    getCampaign(id: bigint): Promise<Campaign | null>;
    getCampaignsByCategory(category: string): Promise<Array<Campaign>>;
    getDonationsByCampaign(campaignId: bigint): Promise<Array<Donation>>;
    getExpenseEntriesByCategory(category: string): Promise<Array<ExpenseEntry>>;
    getFractionalizationSettings(campaignId: bigint): Promise<FractionalizationSettings | null>;
    getGiftsByCampaign(campaignId: bigint): Promise<Array<Gift>>;
    getIncomeEntriesByCategory(category: string): Promise<Array<IncomeEntry>>;
    getUnitClaims(campaignId: bigint): Promise<Array<UnitClaim>>;
    getVolunteersByCampaign(campaignId: bigint): Promise<Array<Volunteer>>;
    recordDonation(campaignId: bigint, amount: number, donorName: string): Promise<Campaign | null>;
    recordGift(campaignId: bigint, itemName: string, estimatedValue: number, description: string, contactEmail: string): Promise<boolean>;
    registerVolunteer(campaignId: bigint, fullName: string, email: string, availability: Array<string>, skills: string): Promise<boolean>;
    setBudgetTarget(category: string, amount: number): Promise<boolean>;
    setFractionalizationSettings(campaignId: bigint, totalUnits: bigint, pricePerUnit: number): Promise<boolean>;
    voteOnProposal(proposalId: bigint, vote: string): Promise<boolean>;
}
