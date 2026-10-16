import { defineCard } from "../define.js";

// Overlord of the Hauntwoods's Everywhere token.

export default defineCard({
  name: "Everywhere Token",
  art: "6b76b7a4-f398-4bb4-833e-97ec0d4e581a",
  colors: [],
  types: ["land"],
  // Every basic land type, and so each one's "{T}: Add [mana]" (rule 305.6);
  // not basic (the ruling).
  subtypes: ["Plains", "Island", "Swamp", "Mountain", "Forest"],
  text: "This land is a Plains, Island, Swamp, Mountain, and Forest. ({T}: Add {W}, {U}, {B}, {R}, or {G}.)",
});
