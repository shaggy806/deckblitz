import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+1 for each creature card in your graveyard.";

export default defineCard({
  name: "Liliana's Elite",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { type: "creature", ownedBy: "you" }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
