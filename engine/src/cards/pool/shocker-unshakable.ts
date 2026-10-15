import { defineCard } from "../define.js";

// EDHREC rank 17955.
//
// One instruction, one damage event (Char's `simultaneous`); the controller
// is read as last-known information if the creature has left (rule 608.2h).

const GAUNTLETS_TEXT =
  "Vibro-Shock Gauntlets — When Shocker enters, he deals 2 damage to target creature and 2 damage to that creature's controller.";

export default defineCard({
  name: "Shocker, Unshakable",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 5,
  toughness: 5,
  text: `During your turn, Shocker has first strike.\n${GAUNTLETS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "damage", amount: 2, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: GAUNTLETS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: "During your turn, Shocker has first strike.",
    },
  ],
});
