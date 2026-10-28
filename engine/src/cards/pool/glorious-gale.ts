import { defineCard } from "../define.js";

// EDHREC rank 5554.
//
// "If it was a legendary spell" asks about the spell as it was targeted on
// the stack, so it's read before the counter moves it. With its target
// illegal the spell does nothing at all, the temptation included (rule
// 608.2b, the ruling).

export default defineCard({
  name: "Glorious Gale",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature spell. If it was a legendary spell, the Ring tempts you.",
  targets: ["creature-spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { supertype: "legendary" } },
    then: { kind: "sequence", effects: [{ kind: "counter", target: 0 }, { kind: "the-ring-tempts-you" }] },
    else: { kind: "counter", target: 0 },
  },
});
