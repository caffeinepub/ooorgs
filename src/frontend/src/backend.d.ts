import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Campaign {
    id: bigint;
    organizerBio: string;
    title: string;
    goalAmount: number;
    active: boolean;
    startAt: string;
    tags: Array<string>;
    organizerName: string;
    endAt: string;
    imageUrl: string;
    shortDescription: string;
    category: string;
    fullDescription: string;
    contributors: bigint;
    amountRaised: number;
}
export interface backendInterface {
    allCampaigns(): Promise<Array<Campaign>>;
    createCampaign(title: string, shortDescription: string, fullDescription: string, category: string, goalAmount: number, organizerName: string, organizerBio: string, imageUrl: string, startAt: string, endAt: string, tags: Array<string>): Promise<Campaign>;
    getCampaign(id: bigint): Promise<Campaign | null>;
}
