import { defineCard } from "../define.js";

// EDHREC rank 4428.
//
// The colour is named as it enters (rule 614.12); the protection spares
// this Aura (rule 702.16n) — a white Ward naming white stays on.
export default defineCard({
  name: "Flickering Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nAs this Aura enters, choose a color.\nEnchanted creature has protection from the chosen color. This effect doesn't remove this Aura.\n{W}: Return this Aura to its owner's hand.",
  targets: ["creature"],
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { chosenColor: true, doesntRemoveSource: true },
      text: "Enchanted creature has protection from the chosen color. This effect doesn't remove this Aura.",
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{W}: Return this Aura to its owner's hand.",
    },
  ],
});
