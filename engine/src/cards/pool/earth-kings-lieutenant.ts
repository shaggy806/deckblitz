import { defineCard } from "../define.js";

// EDHREC rank 7461.
//
// Rulings:
//   [2025-10-02] If Earth King's Lieutenant enters at the same time as another Ally, each of Earth
//     King's Lieutenant's abilities will trigger. You'll put a +1/+1 counter on both creatures.

export default defineCard({
  name: "Earth King's Lieutenant",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, put a +1/+1 counter on each other Ally creature you control.\nWhenever another Ally you control enters, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", subtype: "Ally", controlledBy: "you" },
        exceptSource: true,
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: "When this creature enters, put a +1/+1 counter on each other Ally creature you control.",
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { subtype: "Ally" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever another Ally you control enters, put a +1/+1 counter on this creature.",
    },
  ],
});
