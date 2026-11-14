import { defineCard } from "../define.js";

// EDHREC rank 16440.
const ABILITY_TEXT = "{5}: This creature deals 2 damage to each opponent. Create a 2/2 red Soldier creature token.";

export default defineCard({
  name: "Fire Nation Archers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 3,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, who: "each-opponent" },
          { kind: "create-token", token: "Soldier Token (Red 2/2)", count: 1 },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
