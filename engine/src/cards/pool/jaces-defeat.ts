import { defineCard } from "../define.js";

// EDHREC rank 23805.
//
// "If it was a Jace planeswalker spell" is read off the spell while it's still on the stack
// (Sound the Trumpets' shape); then the counter happens first and the scry after, as printed.
// The scry doesn't hang on the counter working: it asks only what the spell was.

export default defineCard({
  name: "Jace's Defeat",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target blue spell. If it was a Jace planeswalker spell, scry 2.",
  targets: [{ kind: "spell", filter: { colors: ["U"] } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { type: "planeswalker", subtype: "Jace" } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "counter", target: 0 },
        { kind: "scry", amount: 2 },
      ],
    },
    else: { kind: "counter", target: 0 },
  },
});
