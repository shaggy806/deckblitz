import { defineCard } from "../define.js";

// Rulings:
//   [2021-06-18] Paying for echo is always optional. When the echo triggered ability resolves, if
//     you can't pay the echo cost or choose not to, you sacrifice that permanent.
//   [2021-06-18] Your permanent's echo ability will trigger at the beginning of your upkeep if it
//     entered the battlefield since the beginning of your last upkeep, or if you gained control of
//     it since the beginning of your last upkeep.

export default defineCard({
  name: "Bone Shredder",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Minion"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nEcho {2}{B} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, destroy target nonartifact, nonblack creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}{B}", text: "Pay {2}{B}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {2}{B} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", notTypes: ["artifact"], notColors: ["B"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target nonartifact, nonblack creature.",
    },
  ],
});
