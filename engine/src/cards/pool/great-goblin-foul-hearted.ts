import { defineCard } from "../define.js";

// EDHREC rank 15762.
const AMASS_TEXT =
  "Whenever Great Goblin enters or attacks, amass Goblins 3. (Put three +1/+1 counters on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)";
const TRAMPLE_TEXT = "Armies you control have trample.";

export default defineCard({
  name: "Great Goblin, Foul-Hearted",
  manaCost: "{3}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Noble"],
  power: 3,
  toughness: 3,
  text: `${AMASS_TEXT}\n${TRAMPLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 3, creatureType: "Goblin" },
      resolve: null,
      text: AMASS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 3, creatureType: "Goblin" },
      resolve: null,
      text: AMASS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Army", controlledBy: "you" } },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
