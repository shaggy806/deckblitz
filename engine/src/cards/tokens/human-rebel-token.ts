import { defineCard } from "../define.js";

/** 1/1 red Human Rebel — Tarkiran Towelsbane's tokens. No token printing in
 * the Oracle snapshot. */
export default defineCard({
  name: "Human Rebel Token",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rebel"],
  power: 1,
  toughness: 1,
  text: "",
});
