import { defineCard } from "../define.js";

// EDHREC rank 7547. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] You can cycle a card even if it has a triggered ability from cycling that won't
//     have a legal target. This is because the cycling ability and the triggered ability are
//     separate.
//   [2020-04-17] Some cards with cycling have an ability that triggers when you cycle them … These
//     triggered abilities resolve before you draw from the cycling ability.

const CYCLED_TEXT = "When you cycle this card, put a deathtouch counter on target creature you control.";

export default defineCard({
  name: "Void Beckoner",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Horror"],
  power: 8,
  toughness: 8,
  keywords: ["deathtouch"],
  cycling: { cost: "{2}{B}" },
  text: `Deathtouch\nCycling {2}{B} ({2}{B}, Discard this card: Draw a card.)\n${CYCLED_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cycled" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "deathtouch", amount: 1 },
      resolve: null,
      text: CYCLED_TEXT,
    },
  ],
});
