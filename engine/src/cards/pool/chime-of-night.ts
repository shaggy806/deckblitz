import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 21480. Audacity's leave trigger: only from the
// battlefield, so a fizzled Aura spell destroys nothing.

export default defineCard({
  name: "Chime of Night",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura is put into a graveyard from the battlefield, destroy target nonblack creature.",
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: ["nonblack-creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this Aura is put into a graveyard from the battlefield, destroy target nonblack creature.",
    },
  ],
});
