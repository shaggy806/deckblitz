import { defineCard } from "../define.js";

// EDHREC rank 12041.

export default defineCard({
  name: "Pentarch Ward",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  text: "Enchant creature\nAs this Aura enters, choose a color.\nWhen this Aura enters, draw a card.\nEnchanted creature has protection from the chosen color. This effect doesn't remove this Aura.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this Aura enters, draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      protection: { chosenColor: true, doesntRemoveSource: true },
      text: "Enchanted creature has protection from the chosen color. This effect doesn't remove this Aura.",
    },
  ],
});
