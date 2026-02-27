import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Time "mo:core/Time";

module {
  type Campaign = {
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

  type Donation = {
    id : Nat;
    campaignId : Nat;
    amount : Float;
    donorName : Text;
    timestamp : Time.Time;
  };

  type Gift = {
    id : Nat;
    campaignId : Nat;
    itemName : Text;
    estimatedValue : Float;
    description : Text;
    contactEmail : Text;
    timestamp : Time.Time;
  };

  type Volunteer = {
    id : Nat;
    campaignId : Nat;
    fullName : Text;
    email : Text;
    availability : [Text];
    skills : Text;
    timestamp : Time.Time;
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

  type IncomeEntry = {
    id : Nat;
    date : Text;
    ref : Text;
    description : Text;
    category : Text;
    source : Text;
    amount : Float;
    createdAt : Time.Time;
  };

  type ExpenseEntry = {
    id : Nat;
    date : Text;
    ref : Text;
    description : Text;
    category : Text;
    vendor : Text;
    amount : Float;
    createdAt : Time.Time;
  };

  type OldActor = {
    campaigns : Map.Map<Nat, Campaign>;
    donations : Map.Map<Nat, Donation>;
    gifts : Map.Map<Nat, Gift>;
    volunteers : Map.Map<Nat, Volunteer>;
    fractionalizationSettings : Map.Map<Nat, FractionalizationSettings>;
    unitClaims : Map.Map<Nat, [UnitClaim]>;
    incomeEntries : Map.Map<Nat, IncomeEntry>;
    expenseEntries : Map.Map<Nat, ExpenseEntry>;
    nextCampaignId : Nat;
    nextDonationId : Nat;
    nextGiftId : Nat;
    nextVolunteerId : Nat;
    nextIncomeEntryId : Nat;
    nextExpenseEntryId : Nat;
  };

  type NewActor = {
    campaigns : Map.Map<Nat, Campaign>;
    donations : Map.Map<Nat, Donation>;
    gifts : Map.Map<Nat, Gift>;
    volunteers : Map.Map<Nat, Volunteer>;
    fractionalizationSettings : Map.Map<Nat, FractionalizationSettings>;
    unitClaims : Map.Map<Nat, [UnitClaim]>;
    incomeEntries : Map.Map<Nat, IncomeEntry>;
    expenseEntries : Map.Map<Nat, ExpenseEntry>;
    budgetTargets : Map.Map<Text, Float>;
    nextCampaignId : Nat;
    nextDonationId : Nat;
    nextGiftId : Nat;
    nextVolunteerId : Nat;
    nextIncomeEntryId : Nat;
    nextExpenseEntryId : Nat;
  };

  /// Migration function to add budgetTargets to actor
  public func run(old : OldActor) : NewActor {
    { old with budgetTargets = Map.empty<Text, Float>() };
  };
};
