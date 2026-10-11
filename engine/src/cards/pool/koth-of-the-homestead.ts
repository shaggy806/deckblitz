import { defineCard } from "../define.js";

export default defineCard({
  name: "Koth of the Homestead",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 3,
  text: "Landfall — Whenever a land you control enters, you gain 1 life.\nWhenever a Plains you control enters, put a +1/+1 counter on target creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, you gain 1 life.",
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Plains" } },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a Plains you control enters, put a +1/+1 counter on target creature.",
    },
  ],
});
