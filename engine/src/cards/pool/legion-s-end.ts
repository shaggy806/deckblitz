import { defineCard } from "../define.js";

// The target and its namesakes go in one `exile-all`; "that name" is the
// target's as it last existed (rule 608.2h), so a token or a copy still names
// what to exile from the hand and graveyard afterwards.

export default defineCard({
  name: "Legion's End",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile target creature an opponent controls with mana value 2 or less and all other creatures that player controls with the same name as that creature. Then that player reveals their hand and exiles all cards with that name from their hand and graveyard.",
  targets: [
    { kind: "permanent", filter: { type: "creature", controlledBy: "opponent", manaValue: { op: "lte", n: 2 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "exile-all",
        filter: { type: "creature", controlledBy: "you", sameNameWith: 0 },
        controlledByTarget: 0,
      },
      { kind: "reveal-hand", who: { controllerOf: 0 } },
      {
        kind: "exile-graveyard",
        target: { controllerOf: 0 },
        filter: { sameNameWith: 0 },
        fromHand: "also",
      },
    ],
  },
});
