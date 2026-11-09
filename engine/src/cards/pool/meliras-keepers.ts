import { defineCard } from "../define.js";

export default defineCard({
  name: "Melira's Keepers",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  text: "This creature can't have counters put on it.",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "get-counters", object: { isSource: true } }], text: "This creature can't have counters put on it." }],
});
