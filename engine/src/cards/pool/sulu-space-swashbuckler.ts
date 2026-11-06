import { defineCard } from "../define.js";

// EDHREC rank 29893.

const TEXT =
  "Whenever Sulu becomes tapped, if an Equipment or Spacecraft entered the battlefield under your control this turn, draw a card.";

export default defineCard({
  name: "Sulu, Space Swashbuckler",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      condition: {
        kind: "turn-history",
        what: "entered",
        filter: { anyOf: [{ subtype: "Equipment" }, { subtype: "Spacecraft" }] },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
