import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 9845.
// "This creature or another artifact you control" is two triggers: itself
// entering (whatever its types then), and another artifact (Rook Turret's).

const LOOT_TEXT =
  "Whenever this creature or another artifact you control enters, you may draw a card. If you do, discard a card.";

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
  name: "Transplant Theorist",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Artificer"],
  power: 2,
  toughness: 4,
  text: `${LOOT_TEXT}\n{2}: Put target card from your graveyard on the bottom of your library.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOOT,
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" }, otherOnly: true },
      targets: [],
      effect: LOOT,
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: {} }],
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: "{2}: Put target card from your graveyard on the bottom of your library.",
    },
  ],
});
