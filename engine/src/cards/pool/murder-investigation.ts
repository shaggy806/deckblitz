import { defineCard } from "../define.js";

export default defineCard({
  name: "Murder Investigation",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature you control\nWhen enchanted creature dies, create X 1/1 white Soldier creature tokens, where X is its power.",
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: { powerOf: "trigger-object" } },
      resolve: null,
      text: "When enchanted creature dies, create X 1/1 white Soldier creature tokens, where X is its power.",
    },
  ],
});
