import { defineCard } from "../define.js";

// EDHREC rank 3306. Support 2 is Aerie Auxiliary's two optional slots.
// "Whenever you put one or more counters on a creature you don't control":
// counters-put per creature, by you.

const SUPPORT_TEXT = "When this creature enters, support 2. (Put a +1/+1 counter on each of up to two other target creatures.)";
const DRAW_TEXT = "Whenever you put one or more counters on a creature you don't control, draw a card.";

export default defineCard({
  name: "Generous Patron",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Advisor"],
  power: 1,
  toughness: 4,
  text: `${SUPPORT_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: { kind: "other", of: "creature" } },
        { kind: "optional", of: { kind: "other", of: { kind: "other", of: "creature" }, than: { slots: [0] } } },
      ],
      effect: {
        kind: "sequence",
        together: true,
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: SUPPORT_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "any", filter: { type: "creature", controlledBy: "opponent" }, byYou: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
