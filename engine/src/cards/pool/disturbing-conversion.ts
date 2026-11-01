import { defineCard } from "../define.js";

export default defineCard({
  name: "Disturbing Conversion",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  keywords: ["flash"],
  text: "Flash\nEnchant creature\nWhen this Aura enters, each player mills two cards.\nEnchanted creature gets -X/-0, where X is the number of cards in its controller's graveyard.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { inGraveyard: { ownedBy: "you" }, fromAffectedController: true, pt: [-1, 0] },
      text: "Enchanted creature gets -X/-0, where X is the number of cards in its controller's graveyard.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 2 },
      resolve: null,
      text: "When this Aura enters, each player mills two cards.",
    },
  ],
});
