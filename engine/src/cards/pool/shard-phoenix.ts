import { defineCard } from "../define.js";

// EDHREC rank 20215.
//
// Rulings:
//   [2005-08-01] Shard Phoenix uses Last Known Information. If, for example, it was blue when it
//     was sacrificed, the damage will come from a blue source.
//   [2005-08-01] You can return Shard Phoenix any time during your upkeep; this is not a beginning
//     of upkeep triggered ability.

const SAC_TEXT = "Sacrifice this creature: It deals 2 damage to each creature without flying.";
const RETURN_TEXT = "{R}{R}{R}: Return this card from your graveyard to your hand. Activate only during your upkeep.";

export default defineCard({
  name: "Shard Phoenix",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${SAC_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 2 },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      cost: { mana: "{R}{R}{R}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
