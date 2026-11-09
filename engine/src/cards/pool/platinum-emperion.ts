import { defineCard } from "../define.js";

export default defineCard({
  name: "Platinum Emperion",
  manaCost: "{8}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 8,
  toughness: 8,
  text: "Your life total can't change. (You can't gain or lose life. You can't pay any amount of life except 0.)",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "change-life", who: "you" }], text: "Your life total can't change. (You can't gain or lose life. You can't pay any amount of life except 0.)" }],
});
