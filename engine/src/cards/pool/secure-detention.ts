import { defineCard } from "../define.js";

export default defineCard({
  name: "Secure Detention",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant artifact or creature\nWhen this Aura enters, create a 1/1 white Soldier creature token.\nEnchanted permanent can't attack or block, and its activated abilities can't be activated.",
  targets: ["artifact-or-creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: "When this Aura enters, create a 1/1 white Soldier creature token.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted permanent can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
