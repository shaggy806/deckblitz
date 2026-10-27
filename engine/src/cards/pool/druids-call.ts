import { defineCard } from "../define.js";

const TEXT =
  "Whenever enchanted creature is dealt damage, its controller creates that many 1/1 green Squirrel creature tokens.";

export default defineCard({
  name: "Druid's Call",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "create-token", token: "Squirrel Token", count: { triggerValue: true }, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
