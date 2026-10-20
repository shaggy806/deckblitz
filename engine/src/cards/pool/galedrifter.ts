import { defineCard } from "../define.js";

export default defineCard({
  name: "Galedrifter",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Hippogriff"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  disturb: { cost: "{4}{U}" },
  text: "Flying\nDisturb {4}{U} (You may cast this card from your graveyard transformed for its disturb cost.)",
  faces: ["Galedrifter", "Waildrifter"],
  transform: true,
});
