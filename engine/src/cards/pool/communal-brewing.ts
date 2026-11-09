import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this enchantment enters, any number of target opponents each draw a card. Put an ingredient counter on this enchantment, then put an ingredient counter on it for each card drawn this way.";
const CAST_TEXT =
  "Whenever you cast a creature spell, that creature enters with X additional +1/+1 counters on it, where X is the number of ingredient counters on this enchantment.";

export default defineCard({
  name: "Communal Brewing",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "opponent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, simultaneous: true, effect: { kind: "draw", amount: 1, target: 0 } },
          { kind: "add-counter", target: "source", counter: "ingredient", amount: 1 },
          {
            kind: "add-counter",
            target: "source",
            counter: "ingredient",
            amount: { thisWay: "drawn", who: "each-opponent" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "enters-with-counters",
        target: "trigger-object",
        counter: "+1/+1",
        amount: { countersOn: "source", counter: "ingredient" },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
