import { defineCard } from "../define.js";

// EDHREC rank 8595.
//
// The two are chosen as it resolves, not targeted (a `choose-permanents` with
// `thenTogether`: they're the set "chosen this way"), and X is read once: the
// creatures get +X/+X first — both by the same amount, so the difference
// doesn't move — and then the draw reads the same X, whatever the cards
// drawn do to a power. Rulings: the larger power minus the smaller; without
// two creatures, it does nothing.
const TEXT =
  "Choose exactly two creatures you control. You draw X cards and the chosen creatures get +X/+X and gain trample until end of turn, where X is the difference between the chosen creatures' powers.";
const X = { difference: [{ powerOf: 0 }, { powerOf: 1 }], absolute: true } as const;
const CHOSEN = { thisWay: "chosen" } as const;

export default defineCard({
  name: "Spry and Mighty",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "creature" }, atLeast: 2 },
    then: {
      kind: "choose-permanents",
      filter: { type: "creature", controlledBy: "you" },
      min: 2,
      upTo: 2,
      thenTogether: true,
      then: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: CHOSEN, power: X, toughness: X, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: CHOSEN, keyword: "trample", duration: "end-of-turn" },
          { kind: "draw", amount: X },
        ],
      },
      prompt: "Choose exactly two creatures you control",
    },
  },
});
