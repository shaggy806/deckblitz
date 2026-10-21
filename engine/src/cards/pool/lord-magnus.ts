import { defineCard } from "../define.js";

// EDHREC rank 30940.

export default defineCard({
  name: "Lord Magnus",
  manaCost: "{3}{G}{W}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 4,
  toughness: 3,
  keywords: ["first-strike"],
  text: "First strike\nCreatures with plainswalk can be blocked as though they didn't have plainswalk.\nCreatures with forestwalk can be blocked as though they didn't have forestwalk.",
  static: [
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["plainswalk"], text: "Creatures with plainswalk can be blocked as though they didn't have plainswalk." },
    { affects: { scope: "self" }, blockableDespiteLandwalk: ["forestwalk"], text: "Creatures with forestwalk can be blocked as though they didn't have forestwalk." },
  ],
});
