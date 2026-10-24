import { defineCard } from "../define.js";

const MINUS_X = { product: [{ toughnessOf: 0 }, -1] } as const;

export default defineCard({
  name: "Foul Renewal",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Return target creature card from your graveyard to your hand. Target creature gets -X/-X until end of turn, where X is the toughness of the card returned this way.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, "creature"],
  // With no card returned there's no X, and the creature is unaffected (its
  // ruling) — so the -X/-X waits on the return.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "returned-to-hand" },
        then: { kind: "modify-pt", target: 1, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
      },
    ],
  },
});
