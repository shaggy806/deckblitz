import { defineCard } from "../define.js";

// "When it enters this way" — only an escaped entry: the trigger's condition
// reads how the source was cast (`castVia`), from its last-known entry if it
// has left by then.

const ESCAPED_TEXT = "When it enters this way, each opponent sacrifices a non-Gorgon creature of their choice.";

export default defineCard({
  name: "Pharika's Spawn",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 3,
  toughness: 4,
  text:
    "Escape—{5}{B}, Exile three other cards from your graveyard. (You may cast this card from your graveyard for its escape cost.)\n" +
    `This creature escapes with two +1/+1 counters on it. ${ESCAPED_TEXT}`,
  escape: { cost: "{5}{B}", exileCount: 3, counters: { kind: "+1/+1", amount: 2 } },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { castVia: "escape" } },
      targets: [],
      effect: {
        kind: "sacrifice",
        who: "each-opponent",
        filter: { type: "creature", notSubtypes: ["Gorgon"] },
        count: 1,
      },
      resolve: null,
      text: ESCAPED_TEXT,
    },
  ],
});
