import { defineCard } from "../define.js";

// The 1/1 colorless Robot artifact creature token with flying (Spider-Slayer,
// Hatred Honed; Robotics Mastery) — no Hero subtype, unlike "1/1 Robot Hero
// Token".

export default defineCard({
  name: "Robot Token (Flying)",
  art: "15796c4b-6041-4e0a-bc4f-0518d165549e",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying",
});
