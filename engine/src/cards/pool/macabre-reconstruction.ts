import { defineCard } from "../define.js";

const COST_TEXT =
  "This spell costs {2} less to cast if a creature card was put into your graveyard from anywhere this turn.";
const RETURN_TEXT = "Return up to two target creature cards from your graveyard to your hand.";

const CREATURE_CARD = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } as const;

export default defineCard({
  name: "Macabre Reconstruction",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `${COST_TEXT}\n${RETURN_TEXT}`,
  // A permanent card put into your graveyard from anywhere is the turn's
  // `descended` list; a creature card is one, read as the card is (in
  // whatever zone it's in now — a card's types don't change). A token is
  // never a card.
  selfCostReduction: {
    condition: { kind: "turn-history", what: "descended", filter: { type: "creature", token: false } },
    reduceGeneric: 2,
  },
  targets: [
    { kind: "optional", of: CREATURE_CARD },
    { kind: "optional", of: { kind: "other", of: CREATURE_CARD, than: { slots: [0] } } },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
