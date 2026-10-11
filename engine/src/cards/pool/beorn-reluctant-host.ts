import { defineCard } from "../define.js";

// EDHREC rank 12900.
// An adventurer card (rule 715): its Adventure is Till and Tend.

export default defineCard({
  name: "Beorn, Reluctant Host",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bear", "Shapeshifter"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample",
  faces: ["Beorn, Reluctant Host", "Till and Tend"],
  adventure: true,
});
