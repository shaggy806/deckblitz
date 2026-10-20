import { defineCard } from "../define.js";

// EDHREC rank 19898.
//
// Rulings:
//   [2022-02-18] If it is both an enchantment creature and a legendary creature, you still only put
//     one +1/+1 counter on it and it gets +1/+1 until end of turn.
//
// The target's types are read as the spell resolves (Ancient Animus's
// `target` condition): one branch or the other, never both.
const TEXT =
  "Target creature gets +2/+2 until end of turn. If it's an enchantment creature or legendary creature, instead put a +1/+1 counter on it and it gets +1/+1 until end of turn.";

export default defineCard({
  name: "Regent's Authority",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "target",
      index: 0,
      filter: { anyOf: [{ type: "enchantment" }, { supertype: "legendary" }] },
    },
    then: {
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
        { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      ],
    },
    else: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  },
});
