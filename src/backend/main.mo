import Float "mo:core/Float";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
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
    startAt : Text;
    endAt : Text;
    active : Bool;
    tags : [Text];
  };

  type InternalCampaign = Campaign;

  let campaigns = Map.empty<Nat, InternalCampaign>();
  var nextId = 7;

  public shared ({ caller }) func createCampaign(
    title : Text,
    shortDescription : Text,
    fullDescription : Text,
    category : Text,
    goalAmount : Float,
    organizerName : Text,
    organizerBio : Text,
    imageUrl : Text,
    startAt : Text,
    endAt : Text,
    tags : [Text],
  ) : async Campaign {
    let newId = nextId;
    nextId += 1;

    let campaign : InternalCampaign = {
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

  public query ({ caller }) func getCampaign(id : Nat) : async ?Campaign {
    campaigns.get(id);
  };

  public query ({ caller }) func allCampaigns() : async [Campaign] {
    campaigns.values().toArray();
  };
};
