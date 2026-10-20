import { defineCard } from "../define.js";

// Yuna's Whistle's shape: the spell has no target; the reflexive trigger picks
// one once the nonland card is revealed, its damage fixed at that card's mana
// value. The nonland card goes to the bottom with the rest (the rulings);
// with nothing but lands revealed, nothing triggers.
const TEXT =
  "Reveal cards from the top of your library until you reveal a nonland card. Put the revealed cards on the bottom of your library in a random order. When you reveal a nonland card this way, Calibrated Blast deals damage equal to that card's mana value to any target.";

export default defineCard({
  name: "Calibrated Blast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  flashback: { cost: "{3}{R}{R}" },
  text: `${TEXT}\nFlashback {3}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [],
  effect: {
    kind: "reveal-until",
    filter: { notTypes: ["land"] },
    rest: "bottom-random",
    then: {
      kind: "reflexive-trigger",
      targets: ["any-target"],
      value: { manaValueOf: 0 },
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      text: "When you reveal a nonland card this way, Calibrated Blast deals damage equal to that card's mana value to any target.",
    },
  },
});
