import { defineCard } from "../define.js";

// The target opponent reveals the top card of their library (`reveal-top`'s
// `of`, rule 701.20a); it stays there. "The revealed card's mana value" is
// read through the `{ thisWay: "revealed" }` set — 0 with nothing revealed
// (an empty library) — and dealt to that player and each creature they
// control at once (rule 120.2). A land card revealed returns the spell from
// the stack to its owner's hand.

const TEXT =
  "Target opponent reveals the top card of their library. Cerebral Eruption deals damage equal to the revealed card's mana value to that player and each creature that player controls. If a land card is revealed this way, return Cerebral Eruption to its owner's hand.";

const REVEALED_MV = { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "revealed" } } as const;

export default defineCard({
  name: "Cerebral Eruption",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "reveal-top", of: { target: 0 }, then: { kind: "sequence", effects: [] } },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: REVEALED_MV, target: 0 },
          { kind: "damage-all", filter: { type: "creature" }, amount: REVEALED_MV, controlledByTarget: 0 },
        ],
      },
      {
        kind: "conditional",
        condition: { kind: "amounts", left: { thisWay: "revealed", filter: { type: "land" } }, op: "gte", right: 1 },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
