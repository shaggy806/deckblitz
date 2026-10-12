import { defineCard } from "../define.js";

// EDHREC rank 8392.

const TRAMPLE_TEXT = "Each creature you control with a +1/+1 counter on it has trample.";

export default defineCard({
  name: "Drix Fatemaker",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Drix", "Wizard"],
  power: 3,
  toughness: 2,
  text: `When this creature enters, put a +1/+1 counter on target creature.\n${TRAMPLE_TEXT}\nWarp {1}{G} (You may cast this card from your hand for its warp cost. Exile this creature at the beginning of the next end step, then you may cast it from exile on a later turn.)`,
  warp: { cost: "{1}{G}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on target creature.",
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
