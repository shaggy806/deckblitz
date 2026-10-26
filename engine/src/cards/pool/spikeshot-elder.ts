import { defineCard } from "../define.js";

const TEXT = "{1}{R}{R}: This creature deals damage equal to its power to any target.";

// Its power as the ability resolves, or as it last existed (the ruling).
export default defineCard({
  name: "Spikeshot Elder",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}{R}", tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
