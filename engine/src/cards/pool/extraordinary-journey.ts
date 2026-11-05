import { defineCard } from "../define.js";

const EXILE_TEXT =
  "When this enchantment enters, exile up to X target creatures. For each of those cards, its owner may play it for as long as it remains exiled.";
const DRAW_TEXT =
  "Whenever one or more nontoken creatures enter, if one or more of them entered from exile or was cast from exile, you draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Extraordinary Journey",
  manaCost: "{X}{X}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${EXILE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: "x" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: {
          kind: "exile",
          target: 0,
          mayCast: { duration: "while-exiled", play: true, byOwner: true },
        },
      },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        batched: true,
        filter: { type: "creature", token: false, anyOf: [{ enteredFrom: "exile" }, { castFrom: "exile" }] },
      },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
