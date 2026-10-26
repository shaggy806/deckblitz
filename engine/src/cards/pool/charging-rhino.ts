import { defineCard } from "../define.js";

// Portal (POR). EDHREC rank 28017.

const TEXT = "This creature can't be blocked by more than one creature.";

export default defineCard({
  name: "Charging Rhino",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino"],
  power: 4,
  toughness: 4,
  text: TEXT,
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: TEXT }],
});
