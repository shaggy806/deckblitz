import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 17326. X different creatures (the ruling): one
// counter on each, Word of Binding's "X target creatures".

export default defineCard({
  name: "Thrive",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Put a +1/+1 counter on each of X target creatures.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
  },
});
