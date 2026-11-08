import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your end step, target enchantment deals damage equal to its mana value to its controller unless that player sacrifices it.";

export default defineCard({
  name: "Enchanter's Bane",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["enchantment"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ sacrificeThat: 0, text: "Sacrifice it" }],
        otherwise: { kind: "damage", amount: { manaValueOf: 0 }, toControllerOfTarget: 0, from: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
