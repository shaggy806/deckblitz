import { defineCard } from "../define.js";

const TEXT = "Whenever a Merfolk you control becomes tapped, you may gain 1 life.";

export default defineCard({
  name: "Judge of Currents",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "you-control", filter: { subtype: "Merfolk" } },
      targets: [],
      effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
