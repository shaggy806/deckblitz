import { defineCard } from "../define.js";

const EVOLVE_TEXT =
  "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)";
const DRAW_TEXT = "Whenever a +1/+1 counter is put on this creature, you may draw a card.";

const BIGGER = {
  type: "creature",
  anyOf: [
    { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
    { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
  ],
} as const;

export default defineCard({
  name: "Fathom Mage",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${EVOLVE_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: BIGGER },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: BIGGER },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: EVOLVE_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1", perCounter: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
