import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Migration "migration";

(with migration = Migration.run)
actor {
  public type Campaign = {
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

  public type Donation = {
    id : Nat;
    campaignId : Nat;
    amount : Float;
    donorName : Text;
    timestamp : Time.Time;
  };

  public type Gift = {
    id : Nat;
    campaignId : Nat;
    itemName : Text;
    estimatedValue : Float;
    description : Text;
    contactEmail : Text;
    timestamp : Time.Time;
  };

  public type Volunteer = {
    id : Nat;
    campaignId : Nat;
    fullName : Text;
    email : Text;
    availability : [Text];
    skills : Text;
    timestamp : Time.Time;
  };

  public type FractionalizationSettings = {
    totalUnits : Nat;
    pricePerUnit : Float;
    unitsSold : Nat;
  };

  public type UnitClaim = {
    campaignId : Nat;
    claimantName : Text;
    unitsClaimed : Nat;
    timestamp : Time.Time;
  };

  let campaigns = Map.empty<Nat, Campaign>();
  let donations = Map.empty<Nat, Donation>();
  let gifts = Map.empty<Nat, Gift>();
  let volunteers = Map.empty<Nat, Volunteer>();
  let fractionalizationSettings = Map.empty<Nat, FractionalizationSettings>();
  let unitClaims = Map.empty<Nat, [UnitClaim]>();

  var nextCampaignId = 1;
  var nextDonationId = 1;
  var nextGiftId = 1;
  var nextVolunteerId = 1;

  public shared ({ caller }) func createCampaign(
    title : Text,
    shortDescription : Text,
    fullDescription : Text,
    category : Text,
    goalAmount : Float,
    organizerName : Text,
    organizerBio : Text,
    imageUrl : Text,
    startAt : Time.Time,
    endAt : Time.Time,
    tags : [Text],
  ) : async Campaign {
    let newId = nextCampaignId;
    nextCampaignId += 1;

    let campaign : Campaign = {
      id = newId;
      title;
      shortDescription;
      fullDescription;
      category;
      goalAmount;
      amountRaised = 0.0;
      contributors = 0;
      organizerName;
      organizerBio;
      imageUrl;
      startAt;
      endAt;
      active = true;
      tags;
    };

    campaigns.add(newId, campaign);
    campaign;
  };

  public shared ({ caller }) func recordDonation(
    campaignId : Nat,
    amount : Float,
    donorName : Text,
  ) : async ?Campaign {
    switch (campaigns.get(campaignId)) {
      case (null) { null };
      case (?campaign) {
        let donationId = nextDonationId;
        nextDonationId += 1;

        let donation : Donation = {
          id = donationId;
          campaignId;
          amount;
          donorName;
          timestamp = Time.now();
        };

        donations.add(donationId, donation);

        let updatedCampaign = {
          campaign with
          amountRaised = campaign.amountRaised + amount;
          contributors = campaign.contributors + 1;
        };

        campaigns.add(campaignId, updatedCampaign);
        ?updatedCampaign;
      };
    };
  };

  public shared ({ caller }) func recordGift(
    campaignId : Nat,
    itemName : Text,
    estimatedValue : Float,
    description : Text,
    contactEmail : Text,
  ) : async Bool {
    switch (campaigns.get(campaignId)) {
      case (null) { false };
      case (?_campaign) {
        let giftId = nextGiftId;
        nextGiftId += 1;

        let gift : Gift = {
          id = giftId;
          campaignId;
          itemName;
          estimatedValue;
          description;
          contactEmail;
          timestamp = Time.now();
        };

        gifts.add(giftId, gift);
        true;
      };
    };
  };

  public shared ({ caller }) func registerVolunteer(
    campaignId : Nat,
    fullName : Text,
    email : Text,
    availability : [Text],
    skills : Text,
  ) : async Bool {
    switch (campaigns.get(campaignId)) {
      case (null) { false };
      case (?_campaign) {
        let volunteerId = nextVolunteerId;
        nextVolunteerId += 1;

        let volunteer : Volunteer = {
          id = volunteerId;
          campaignId;
          fullName;
          email;
          availability;
          skills;
          timestamp = Time.now();
        };

        volunteers.add(volunteerId, volunteer);
        true;
      };
    };
  };

  public query ({ caller }) func getCampaign(id : Nat) : async ?Campaign {
    campaigns.get(id);
  };

  public query ({ caller }) func allCampaigns() : async [Campaign] {
    campaigns.values().toArray();
  };

  public query ({ caller }) func getDonationsByCampaign(campaignId : Nat) : async [Donation] {
    let filtered = donations.values().filter(
      func(donation) {
        donation.campaignId == campaignId;
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getGiftsByCampaign(campaignId : Nat) : async [Gift] {
    let filtered = gifts.values().filter(
      func(gift) {
        gift.campaignId == campaignId;
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getVolunteersByCampaign(campaignId : Nat) : async [Volunteer] {
    let filtered = volunteers.values().filter(
      func(volunteer) {
        volunteer.campaignId == campaignId;
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getCampaignsByCategory(category : Text) : async [Campaign] {
    let filtered = campaigns.values().filter(
      func(campaign) {
        campaign.category == category;
      }
    );
    filtered.toArray();
  };

  public query ({ caller }) func getActiveCampaigns() : async [Campaign] {
    let filtered = campaigns.values().filter(
      func(campaign) {
        campaign.active == true;
      }
    );
    filtered.toArray();
  };

  public shared ({ caller }) func setFractionalizationSettings(
    campaignId : Nat,
    totalUnits : Nat,
    pricePerUnit : Float,
  ) : async Bool {
    switch (campaigns.get(campaignId)) {
      case (null) { false };
      case (?_campaign) {
        let settings : FractionalizationSettings = {
          totalUnits;
          pricePerUnit;
          unitsSold = 0;
        };
        fractionalizationSettings.add(campaignId, settings);
        true;
      };
    };
  };

  public shared ({ caller }) func claimUnits(
    campaignId : Nat,
    claimantName : Text,
    units : Nat,
  ) : async Bool {
    switch (fractionalizationSettings.get(campaignId)) {
      case (null) { false };
      case (?settings) {
        if (settings.unitsSold + units > settings.totalUnits) {
          return false;
        };

        let claim : UnitClaim = {
          campaignId;
          claimantName;
          unitsClaimed = units;
          timestamp = Time.now();
        };

        let existingClaims = switch (unitClaims.get(campaignId)) {
          case (null) { [] };
          case (?claims) { claims };
        };

        let updatedClaims = existingClaims.concat([claim]);
        unitClaims.add(campaignId, updatedClaims);

        let updatedSettings = {
          settings with
          unitsSold = settings.unitsSold + units;
        };
        fractionalizationSettings.add(campaignId, updatedSettings);
        true;
      };
    };
  };

  public query ({ caller }) func getFractionalizationSettings(campaignId : Nat) : async ?FractionalizationSettings {
    fractionalizationSettings.get(campaignId);
  };

  public query ({ caller }) func getUnitClaims(campaignId : Nat) : async [UnitClaim] {
    switch (unitClaims.get(campaignId)) {
      case (null) { [] };
      case (?claims) { claims };
    };
  };

  public query ({ caller }) func getAllFractionalizationSettings() : async [(Nat, FractionalizationSettings)] {
    fractionalizationSettings.toArray();
  };
};
