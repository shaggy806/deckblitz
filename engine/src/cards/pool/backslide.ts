import { defineCard } from "../define.js";

// EDHREC rank 23307.
//
// Rulings:
//   [2008-10-01] Cycling is an activated ability. Effects that interact with activated abilities
//     (such as Stifle or Rings of Brighthearth) will interact with cycling. Effects that interact
//     with spells (such as Remove Soul or Faerie Tauntings) will not.

export default defineCard({
  name: "Backslide",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  cycling: { cost: "{U}" },
  text: "Turn target creature with a morph ability face down.\nCycling {U} ({U}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", hasKeyword: "morph" } }],
  effect: { kind: "turn-face-down", target: 0 },
});
