import { defineCard } from "../define.js";

// EDHREC rank 11704. Wilds of Eldraine. Adventure: Mend the Wilds.
const ENTER_TEXT = "When this creature enters, draw a card.";

export default defineCard({
  name: "Woodland Acolyte",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Woodland Acolyte", "Mend the Wilds"],
  adventure: true,
});
