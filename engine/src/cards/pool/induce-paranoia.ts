import { defineCard } from "../define.js";

// EDHREC rank 21628. Ravnica: City of Guilds.
//
// "That spell's controller" is the countered spell's slot (Broken Ambitions'
// mill shape); X reads its mana value as it last was on the stack (Spell
// Swindle). The mill happens even if the spell can't be countered.

export default defineCard({
  name: "Induce Paranoia",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If {B} was spent to cast this spell, that spell's controller mills X cards, where X is the spell's mana value.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { B: 1 } } },
        then: { kind: "mill", target: 0, amount: { manaValueOf: 0 } },
      },
    ],
  },
});
