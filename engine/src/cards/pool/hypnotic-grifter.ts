import { defineCard } from "../define.js";

export default defineCard({
  name: "Hypnotic Grifter",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 2,
  text: "{3}: This creature connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "connive", target: "source" },
      resolve: null,
      text: "{3}: This creature connives.",
    },
  ],
});
