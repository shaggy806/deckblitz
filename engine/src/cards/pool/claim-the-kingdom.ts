import { defineCard } from "../define.js";

const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, put a +1/+1 counter on target creature you control and a plan counter on this enchantment.";
const PLAN_TEXT =
  "When the fourth plan counter is put on this enchantment, sacrifice it. When you do, put an indestructible counter on target creature you control.";

export default defineCard({
  name: "Claim the Kingdom",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Plan"],
  text: `${LANDFALL_TEXT}\n${PLAN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: "source", counter: "plan", amount: 1 },
        ],
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", counter: "plan", nth: 4 },
      targets: [],
      effect: {
        kind: "sacrifice-source",
        then: {
          kind: "reflexive-trigger",
          targets: ["creature-you-control"],
          effect: { kind: "add-counter", target: 0, counter: "indestructible", amount: 1 },
          text: "Put an indestructible counter on target creature you control.",
        },
      },
      resolve: null,
      text: PLAN_TEXT,
    },
  ],
});
