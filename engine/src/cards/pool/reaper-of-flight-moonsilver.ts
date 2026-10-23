import { defineCard } from "../define.js";

// EDHREC rank 28110.
//
// Rulings:
//   To activate such an ability, there must be four or more card types among cards in your
//     graveyard. The number of card types is not rechecked as the ability resolves.
//
// Raving Visionary's delirium activation restriction (rule 602.5); Ayara's
// `otherOnly` keeps this creature out of its own sacrifice.

const PUMP_TEXT =
  "Delirium — Sacrifice another creature: This creature gets +2/+1 until end of turn. Activate only if there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Reaper of Flight Moonsilver",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
