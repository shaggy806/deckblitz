import { defineCard } from "../define.js";

// EDHREC rank 26408.

const TAP_TEXT = "{T}: This creature deals 2 damage to target player or battle.";

export default defineCard({
  name: "Onakke Javelineer",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Spirit"],
  power: 5,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${TAP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      // A battle, or any player (the permanent slot's `orPlayer`); damage
      // to a battle removes defense counters (rule 310.6).
      targets: [{ kind: "permanent", filter: { type: "battle" }, orPlayer: "any" }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
