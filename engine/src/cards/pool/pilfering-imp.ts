import { defineCard } from "../define.js";

// EDHREC rank 16642.
const TEXT =
  "{1}{B}, {T}, Sacrifice this creature: Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. Activate only as a sorcery.";

export default defineCard({
  name: "Pilfering Imp",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, sacrifice: "self" },
      targets: ["opponent"],
      effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
