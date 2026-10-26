import { defineCard } from "../define.js";

// Planar Chaos (PLC).
const TEXT =
  "Whenever Oros deals combat damage to a player, you may pay {2}{W}. If you do, Oros deals 3 damage to each nonwhite creature.";

export default defineCard({
  name: "Oros, the Avenger",
  manaCost: "{3}{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{W} to have Oros deal 3 damage to each nonwhite creature?",
        cost: "{2}{W}",
        effect: { kind: "damage-all", filter: { type: "creature", notColors: ["W"] }, amount: 3 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
