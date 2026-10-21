import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 27262.
//
// Impending Doom's shape: the damage goes to the dead creature's controller
// (`"trigger-controller"`), and its toughness is read as it last existed on
// the battlefield.
const TEXT =
  "When enchanted creature dies, this Aura deals damage equal to that creature's toughness to the creature's controller.";

export default defineCard({
  name: "Creature Bond",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: { toughnessOf: "trigger-object" }, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
