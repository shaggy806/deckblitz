import { defineCard } from "../define.js";

const ECHO_TEXT =
  "Echo {2}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)";
const TEXT = "When this creature enters or dies, put a +1/+1 counter on target creature.";

export default defineCard({
  name: "Hunting Moa",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bird", "Beast"],
  power: 3,
  toughness: 2,
  text: `${ECHO_TEXT}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}{G}", text: "Pay {2}{G}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: ECHO_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
