import { defineCard } from "../define.js";

// EDHREC rank 22716.
//
// "Your graveyard" is the Aura's controller's, read from its side
// (`grantPtPerCount.inGraveyard` with `ownedBy: "you"` — Song of
// Stupefaction's shape over every card).

const PT_TEXT = "Enchanted creature gets -X/-0, where X is the number of cards in your graveyard.";

export default defineCard({
  name: "Fear of Death",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nWhen this Aura enters, mill two cards. (Put the top two cards of your library into your graveyard.)\n${PT_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: "When this Aura enters, mill two cards.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { inGraveyard: { ownedBy: "you" }, pt: [-1, 0] },
      text: PT_TEXT,
    },
  ],
});
