import { defineCard } from "../define.js";

// Alliances. EDHREC rank 24872.
//
// Heraldic Banner's shape: the colour is chosen as it enters (rule 614.12),
// and it taps for that colour.

export default defineCard({
  name: "Sol Grail",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "As this artifact enters, choose a color.\n{T}: Add one mana of the chosen color.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
  ],
});
