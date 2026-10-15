import { defineCard } from "../define.js";

// EDHREC rank 13873.
//
// The spell's mana spent against its mana value ({X} as chosen — the ruling)
// is read while it's still on the stack, before the counter moves it; then
// the counter happens first and the draw after, as printed. The draw doesn't
// hang on the counter working: a spell that can't be countered still gets
// you the card.

export default defineCard({
  name: "Unravel",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If the amount of mana spent to cast that spell was less than its mana value, you draw a card.",
  targets: ["spell"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { manaSpent: { op: "lt", n: { own: "manaValue" } } } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "counter", target: 0 },
        { kind: "draw", amount: 1 },
      ],
    },
    else: { kind: "counter", target: 0 },
  },
});
