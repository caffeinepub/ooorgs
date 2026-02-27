import Map "mo:core/Map";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
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

  public type Actor = {
    campaigns : Map.Map<Nat, Campaign>;
    nextId : Nat;
  };

  public func run(old : {}) : Actor {
    let initialCampaigns = Map.empty<Nat, Campaign>();

    let campaign1 : Campaign = {
      id = 1;
      title = "Clean Water for Rural Communities";
      shortDescription = "Bringing clean, safe water to remote villages in Africa through sustainable infrastructure projects. This campaign funds the drilling of wells, installation of filtration systems, and community training on water management protocols. Your support directly improves health, reduces waterborne diseases, and empowers over 10,000 residents with reliable access to life&#39;s most essential resource.";
      fullDescription = "This comprehensive initiative addresses the critical need for clean water in rural African communities. Many villages currently rely on unsafe water sources, leading to high rates of disease and child mortality. Our project involves site assessments, the drilling of deep, protected wells, installation of solar-powered pumps, and advanced filtration systems. We partner with local organizations for ongoing maintenance training and community education on water management. The goal is to create self-sustaining solutions that drastically improve health outcomes and overall quality of life.";
      category = "Environment";
      goalAmount = 500000.0;
      amountRaised = 287340.0;
      contributors = 1842;
      organizerName = "AquaLife Foundation";
      organizerBio = "AquaLife Foundation is dedicated to improving global access to clean water. Our team of water engineers, health experts, and community organizers has successfully completed over 100 projects across Africa. We focus on sustainable, community-driven solutions that last for generations.";
      imageUrl = "https://images.unsplash.com/photo-1464983953574-0892a716854b";
      startAt = "2026-01-01";
      endAt = "2026-12-31";
      active = true;
      tags = ["water", "africa", "infrastructure", "health", "community"];
    };

    let campaign2 : Campaign = {
      id = 2;
      title = "Children&#39;s Literacy Program";
      shortDescription = "Empowering young minds with the gift of literacy by providing books, educational materials, and dedicated instructors to underserved communities. This program aims to foster a love of reading, improve academic performance, and open doors to a brighter future.";
      fullDescription = "Our Children&#39;s Literacy Program is dedicated to closing the education gap by offering comprehensive reading support to children in need. The initiative includes the distribution of age-appropriate books, interactive storytelling sessions, expert tutoring, and parental engagement workshops. We prioritize culturally relevant materials and work closely with local schools and educators to tailor the program to each community&#39;s unique needs. Through this campaign, we aim to instill confidence, curiosity, and a lifelong passion for learning in every child we reach.";
      category = "Education";
      goalAmount = 75000.0;
      amountRaised = 48200.0;
      contributors = 934;
      organizerName = "ReadForward Alliance";
      organizerBio = "ReadForward Alliance is a non-profit organization committed to promoting literacy and educational equity. Our team consists of experienced teachers, child development specialists, and community leaders who believe that every child deserves the chance to succeed through reading.";
      imageUrl = "https://images.unsplash.com/photo-1482062364825-616fd23b8fc1";
      startAt = "2026-02-01";
      endAt = "2026-08-31";
      active = true;
      tags = ["education", "literacy", "children", "books", "schools"];
    };

    let campaign3 : Campaign = {
      id = 3;
      title = "Mobile Health Clinic Network";
      shortDescription = "Delivering essential healthcare services to underserved rural areas with a fleet of fully-equipped mobile clinics. This network provides on-site medical exams, vaccinations, maternal and child health services, and health education to communities with limited access to healthcare facilities.";
      fullDescription = "The Mobile Health Clinic Network is designed to bring quality healthcare directly to those who need it most. Each clinic is staffed by experienced medical professionals and equipped with state-of-the-art diagnostic tools and medications. Our services include general health screenings, chronic disease management, prenatal care, immunizations, and emergency response. We also offer health education workshops and collaborate with local healthcare providers for follow-up care. The network operates on a rotating schedule to ensure consistent access and build lasting trust within the communities we serve.";
      category = "Health";
      goalAmount = 180000.0;
      amountRaised = 62500.0;
      contributors = 512;
      organizerName = "MediReach Global";
      organizerBio = "MediReach Global is a non-profit organization focused on improving healthcare accessibility worldwide. Our network of volunteer doctors, nurses, and health educators is passionate about bridging the gap in medical services for underserved populations.";
      imageUrl = "https://images.unsplash.com/photo-1465101178521-c1a9136a3744";
      startAt = "2026-03-01";
      endAt = "2026-11-30";
      active = true;
      tags = ["health", "medical", "mobile", "solar", "rural", "volunteers"];
    };

    let campaign4 : Campaign = {
      id = 4;
      title = "Urban Community Garden Collective";
      shortDescription = "Transforming vacant urban spaces into vibrant community gardens that promote food security, environmental sustainability, and community engagement. This project provides residents with access to fresh produce, gardening education, and a shared space for social connection.";
      fullDescription = "The Urban Community Garden Collective is dedicated to creating green oases in the heart of cities. Each garden is designed collaboratively with local residents to reflect their unique needs and preferences. We offer gardening workshops, sustainable agriculture training, and educational programs for children. The gardens not only improve food access but also enhance environmental awareness and community resilience. Through this initiative, we aim to foster a deeper connection to nature and empower individuals to take an active role in their well-being.";
      category = "Community";
      goalAmount = 28000.0;
      amountRaised = 19750.0;
      contributors = 387;
      organizerName = "GreenRoots Collective";
      organizerBio = "GreenRoots Collective is a grassroots organization committed to promoting sustainable urban development. Our team includes horticulturists, educators, and urban planners who work together to build thriving, green communities.";
      imageUrl = "https://images.unsplash.com/photo-1586773860416-8a68b164859b";
      startAt = "2026-01-15";
      endAt = "2026-06-30";
      active = true;
      tags = ["urban", "food", "gardens", "community", "sustainability"];
    };

    let campaign5 : Campaign = {
      id = 5;
      title = "Traditional Arts Preservation Fund";
      shortDescription = "Supporting the preservation and promotion of traditional art forms through funding for artist residencies, cultural education programs, and community exhibitions. This initiative celebrates cultural diversity and ensures that cherished artistic traditions are passed down to future generations.";
      fullDescription = "The Traditional Arts Preservation Fund is committed to safeguarding the rich tapestry of artistic heritage found in communities worldwide. We provide grants to master artists for teaching apprentices, organize cultural festivals to showcase traditional arts, and support the creation of educational materials that document unique techniques. By investing in both artists and communities, we aim to create a sustainable ecosystem where traditional arts can thrive. Your support helps bridge the gap between past and present, keeping these priceless cultural treasures alive for generations to come.";
      category = "Arts";
      goalAmount = 45000.0;
      amountRaised = 11200.0;
      contributors = 228;
      organizerName = "Heritage Alive Trust";
      organizerBio = "Heritage Alive Trust is a non-profit dedicated to preserving cultural traditions through the arts. Our team of artists, historians, and cultural advocates work tirelessly to support and celebrate the world&#39;s diverse artistic heritage.";
      imageUrl = "https://images.unsplash.com/photo-1464983953574-0892a716854b";
      startAt = "2026-04-01";
      endAt = "2027-03-31";
      active = true;
      tags = ["arts", "culture", "heritage", "preservation", "education"];
    };

    let campaign6 : Campaign = {
      id = 6;
      title = "Emergency Disaster Relief Response";
      shortDescription = "Providing immediate and effective relief to communities affected by natural disasters and emergencies. This fund supports rapid deployment of food, medical supplies, and shelter to those in urgent need, ensuring that help reaches the most vulnerable populations first.";
      fullDescription = "The Emergency Disaster Relief Response campaign is designed to provide fast, efficient aid in the wake of hurricanes, floods, earthquakes, and other disasters. Our experienced response teams deploy with essential supplies, medical equipment, and temporary shelter within hours of a crisis. We collaborate with local organizations to maximize resources and ensure aid is distributed equitably. In addition to immediate relief, we also offer support for long-term recovery efforts, helping communities rebuild stronger and more resilient than ever. Your contribution saves lives when it matters most.";
      category = "Emergency";
      goalAmount = 250000.0;
      amountRaised = 134800.0;
      contributors = 2103;
      organizerName = "RapidAid Network";
      organizerBio = "RapidAid Network is a humanitarian organization specializing in disaster response and recovery. Our team of logistics experts, medical professionals, and community leaders work around the clock to deliver life-saving support wherever and whenever it&#39;s needed.";
      imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
      startAt = "2026-01-01";
      endAt = "2026-12-31";
      active = true;
      tags = ["emergency", "relief", "disaster", "food", "shelter", "medical"];
    };

    initialCampaigns.add(1, campaign1);
    initialCampaigns.add(2, campaign2);
    initialCampaigns.add(3, campaign3);
    initialCampaigns.add(4, campaign4);
    initialCampaigns.add(5, campaign5);
    initialCampaigns.add(6, campaign6);

    {
      campaigns = initialCampaigns;
      nextId = 7;
    };
  };
};
