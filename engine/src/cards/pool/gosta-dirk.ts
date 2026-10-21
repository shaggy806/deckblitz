import { defineCard } from "../define.js";

// EDHREC rank 30959.

export default defineCard({
  name: "Gosta Dirk",
  manaCost: "{3}{W}{W}{U}{U}",
  colors: ["U", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["first-strike"],
  text: "First strike\nCreatures with islandwalk can be blocked as though they didn't have islandwalk.",
  static: [
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["islandwalk"], text: "Creatures with islandwalk can be blocked as though they didn't have islandwalk." },
  ],
});
