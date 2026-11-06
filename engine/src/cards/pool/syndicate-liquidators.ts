import { defineCard } from "../define.js";

// EDHREC rank 29814.

export default defineCard({
  name: "Syndicate Liquidators",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Orion", "Pirate"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: "Trample\nLandfall — Whenever a land you control enters, put two +1/+1 counters on target creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "Landfall — Whenever a land you control enters, put two +1/+1 counters on target creature you control.",
    },
  ],
});
