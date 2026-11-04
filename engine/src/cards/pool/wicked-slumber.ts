import { defineCard } from "../define.js";

// Each counter is a choice as it resolves, among the targets still legal: both on
// one, or one each. With one left, both go on it (the rulings).
export default defineCard({
  name: "Wicked Slumber",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  convoke: true,
  text:
    "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\n" +
    "Tap up to two target creatures. Put a stun counter on either of them. Then put a stun counter on either of them. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
  targets: [{ kind: "any-number", of: "creature", max: 2 }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "tap", target: 0 } },
      {
        kind: "choose-among-targets",
        chooser: "you",
        count: 1,
        prompt: "Put a stun counter on either of them",
        chosen: { effect: { kind: "add-counter", target: 0, counter: "stun", amount: 1 } },
      },
      {
        kind: "choose-among-targets",
        chooser: "you",
        count: 1,
        prompt: "Put a stun counter on either of them",
        chosen: { effect: { kind: "add-counter", target: 0, counter: "stun", amount: 1 } },
      },
    ],
  },
});
