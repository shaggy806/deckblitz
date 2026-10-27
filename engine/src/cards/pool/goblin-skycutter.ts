import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 28853. Vertigo's effect behind a
// sacrifice-self cost; "it" deals the damage as it last existed.

const SAC_TEXT =
  "Sacrifice this creature: It deals 2 damage to target creature with flying. That creature loses flying until end of turn.";

export default defineCard({
  name: "Goblin Skycutter",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 2,
  toughness: 1,
  text: SAC_TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: 0 },
          { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
