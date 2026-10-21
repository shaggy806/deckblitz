import { defineCard } from "../define.js";

// EDHREC rank 7940. Ikoria: Lair of Behemoths.
//
// Which half happens is decided as the trigger resolves (its ruling), so it's a
// `conditional`: `controls-greatest` holds for a creature tied for the
// greatest power (the ruling) and fails when you control no creature (no
// creatures at all: no draw). Otherwise the counter goes on a creature you
// choose as it resolves — not a target — or nowhere if you control none.
const TEXT =
  "At the beginning of your upkeep, draw a card if you control a creature with the greatest power among creatures on the battlefield. Otherwise, put a +1/+1 counter on a creature you control.";

export default defineCard({
  name: "Primal Empathy",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls-greatest", of: "power", filter: { type: "creature" } },
        then: { kind: "draw", amount: 1 },
        else: {
          kind: "choose-permanents",
          filter: { type: "creature", controlledBy: "you" },
          upTo: 1,
          min: 1,
          then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          prompt: "Put a +1/+1 counter on a creature you control",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
