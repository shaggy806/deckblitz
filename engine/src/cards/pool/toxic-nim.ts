import { defineCard } from "../define.js";

export default defineCard({
  name: "Toxic Nim",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 4,
  toughness: 1,
  keywords: ["infect"],
  text: "Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
});
