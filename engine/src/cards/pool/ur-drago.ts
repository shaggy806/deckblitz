import { defineCard } from "../define.js";

// EDHREC rank 31212.

export default defineCard({
  name: "Ur-Drago",
  manaCost: "{3}{U}{U}{B}{B}",
  colors: ["B", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: "First strike\nCreatures with swampwalk can be blocked as though they didn't have swampwalk.",
  static: [
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["swampwalk"], text: "Creatures with swampwalk can be blocked as though they didn't have swampwalk." },
  ],
});
