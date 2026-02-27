import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Time "mo:core/Time";

module {
  type OldCampaign = {
    id : Nat;
    title : Text;
    shortDescription : Text;
    fullDescription : Text;
    category : Text;
    goalAmount : Float;
    amountRaised : Float;
    contributors : Nat;
    organizerName : Text;
    organizerBio : Text;
    imageUrl : Text;
    startAt : Time.Time;
    endAt : Time.Time;
    active : Bool;
    tags : [Text];
  };

  type OldDonation = {
    id : Nat;
    campaignId : Nat;
    amount : Float;
    donorName : Text;
    timestamp : Time.Time;
  };

  type OldGift = {
    id : Nat;
    campaignId : Nat;
    itemName : Text;
    estimatedValue : Float;
    description : Text;
    contactEmail : Text;
    timestamp : Time.Time;
  };

  type OldVolunteer = {
    id : Nat;
    campaignId : Nat;
    fullName : Text;
    email : Text;
    availability : [Text];
    skills : Text;
    timestamp : Time.Time;
  };

  type OldActor = {
    campaigns : Map.Map<Nat, OldCampaign>;
    donations : Map.Map<Nat, OldDonation>;
    gifts : Map.Map<Nat, OldGift>;
    volunteers : Map.Map<Nat, OldVolunteer>;
    nextCampaignId : Nat;
    nextDonationId : Nat;
    nextGiftId : Nat;
    nextVolunteerId : Nat;
  };

  type FractionalizationSettings = {
    totalUnits : Nat;
    pricePerUnit : Float;
    unitsSold : Nat;
  };

  type UnitClaim = {
    campaignId : Nat;
    claimantName : Text;
    unitsClaimed : Nat;
    timestamp : Time.Time;
  };

  type NewActor = {
    campaigns : Map.Map<Nat, OldCampaign>;
    donations : Map.Map<Nat, OldDonation>;
    gifts : Map.Map<Nat, OldGift>;
    volunteers : Map.Map<Nat, OldVolunteer>;
    fractionalizationSettings : Map.Map<Nat, FractionalizationSettings>;
    unitClaims : Map.Map<Nat, [UnitClaim]>;
    nextCampaignId : Nat;
    nextDonationId : Nat;
    nextGiftId : Nat;
    nextVolunteerId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      fractionalizationSettings = Map.empty<Nat, FractionalizationSettings>();
      unitClaims = Map.empty<Nat, [UnitClaim]>();
    };
  };
};
