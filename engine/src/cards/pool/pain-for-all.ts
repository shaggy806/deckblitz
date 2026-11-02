import { defineCard } from "../define.js";

const ENTERS = "When this Aura enters, enchanted creature deals damage equal to its power to any other target.";
const DEALT = "Whenever enchanted creature is dealt damage, it deals that much damage to each opponent.";

export default defineCard({
  name: "Pain for All",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${ENTERS}\n${DEALT}`,
  targets: ["creature-you-control"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "any-target", than: "host" }],
      effect: { kind: "damage", amount: { powerOf: "attached" }, target: 0, from: "attached" },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "each-opponent", from: "trigger-object" },
      resolve: null,
      text: DEALT,
    },
  ],
});
