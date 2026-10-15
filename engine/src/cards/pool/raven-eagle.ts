import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// EDHREC rank 10316. "Enters or attacks" is two triggers with one effect —
// Mastermind Plum's exile, Feral Appetite's "if a creature card is exiled
// this way". The draw trigger is Kang, Temporal Tyrant's: the second card
// drawn each turn only (the rulings).
const EXILE_TEXT =
  "Whenever this creature enters or attacks, exile up to one target card from a graveyard. If a creature card is exiled this way, create a Clue token.";
const DRAW_TEXT = "Whenever you draw your second card each turn, each opponent loses 1 life and you gain 1 life.";
const EXILE: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "exile", target: 0 },
    {
      kind: "conditional",
      condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
      then: { kind: "create-token", token: "Clue Token", count: 1 },
    },
  ],
};
const GRAVEYARD_CARD = [{ kind: "optional", of: { kind: "card-in-graveyard" } }] as const;

export default defineCard({
  name: "Raven Eagle",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird", "Assassin"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${EXILE_TEXT} (It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: GRAVEYARD_CARD,
      effect: EXILE,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: GRAVEYARD_CARD,
      effect: EXILE,
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
