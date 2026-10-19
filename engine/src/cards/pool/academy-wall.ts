import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 13326.
//
// Riddlesmith's loot, on Bloombrute's "triggers only once each turn". The
// draw and the discard happen while the ability resolves, nothing between
// them (the ruling).
const TEXT =
  "Whenever you cast an instant or sorcery spell, you may draw a card. If you do, discard a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Academy Wall",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 5,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: { kind: "draw", amount: 1 },
        then: { kind: "discard", target: "you", amount: 1 },
      },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
