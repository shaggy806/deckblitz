import { defineCard } from "../define.js";

export default defineCard({
  name: "Zahid, Djinn of the Lamp",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  text: "You may pay {3}{U} and tap an untapped artifact you control rather than pay this spell's mana cost.\nFlying",
  alternativeCost: { mana: "{3}{U}", tapCreatures: { count: 1, filter: { type: "artifact" } } },
});
