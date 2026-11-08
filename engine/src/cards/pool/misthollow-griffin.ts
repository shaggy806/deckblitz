import { defineCard } from "../define.js";

export default defineCard({
  name: "Misthollow Griffin",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nYou may cast this card from exile.",
  mayPlaySelf: { from: ["exile"] },
});
