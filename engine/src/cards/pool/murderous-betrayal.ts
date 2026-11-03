import { defineCard } from "../define.js";

const TEXT = "{B}{B}, Pay half your life, rounded up: Destroy target nonblack creature. It can't be regenerated.";

export default defineCard({
  name: "Murderous Betrayal",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false, payLife: "half-rounded-up" },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
