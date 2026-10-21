import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 14902. Transplant Theorist's two triggers: itself entering
// (whatever its types), and another non-Human creature you control.

const TEXT =
  "Whenever this creature or another non-Human creature you control enters, you may draw a card. If you do, discard a card.";

const LOOT: EffectSpec = {
  kind: "may",
  prompt: "Draw a card, then discard a card?",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "drawn", who: "you" },
        then: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
};

export default defineCard({
  name: "Sage of the Falls",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOOT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", notSubtypes: ["Human"] },
        otherOnly: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: LOOT,
      resolve: null,
      text: TEXT,
    },
  ],
});
