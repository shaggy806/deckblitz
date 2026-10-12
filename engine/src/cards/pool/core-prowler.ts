import { defineCard } from "../define.js";

export default defineCard({
  name: "Core Prowler",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 2,
  toughness: 2,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\nWhen this creature dies, proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: "When this creature dies, proliferate.",
    },
  ],
});
