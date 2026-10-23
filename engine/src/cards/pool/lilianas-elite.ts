import { defineCard } from "../define.js";

export default defineCard({
  name: "Liliana's Elite",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: "This creature gets +1/+1 for each creature card in your graveyard.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { type: "creature", ownedBy: "you" }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each creature card in your graveyard.",
    },
  ],
});
