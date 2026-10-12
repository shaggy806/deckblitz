import { defineCard } from "../define.js";

export default defineCard({
  name: "Viral Drake",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Drake"],
  power: 1,
  toughness: 4,
  keywords: ["flying", "infect"],
  text: "Flying\nInfect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n{3}{U}: Proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: "{3}{U}: Proliferate.",
    },
  ],
});
