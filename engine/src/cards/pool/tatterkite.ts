import { defineCard } from "../define.js";

export default defineCard({
  name: "Tatterkite",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature can't have counters put on it.",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "get-counters", object: { isSource: true } }], text: "This creature can't have counters put on it." }],
});
