import { defineCard } from "../define.js";

// EDHREC rank 22490.

export default defineCard({
  name: "Karn, Gilded Guardian",
  manaCost: "{2/W}{2/U}{2/B}{2/R}{2/G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "trample"],
  text: "Vigilance, trample\nWhen Karn enters, draw a card for each color among other artifacts you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "draw",
        amount: { colorsAmong: { type: "artifact", controlledBy: "you" }, excludeSelf: true },
      },
      resolve: null,
      text: "When Karn enters, draw a card for each color among other artifacts you control.",
    },
  ],
});
