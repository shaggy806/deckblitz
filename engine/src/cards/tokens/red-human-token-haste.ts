import { defineCard } from "../define.js";

/** 1/1 red Human with haste — Thatcher Revolt's token. ("Red Human Token" is
 * the one without haste; the engine keys tokens by name.) */
export default defineCard({
  name: "Red Human Token (Haste)",
  tokenName: "Human",
  art: "5da1ef9d-878a-49d8-afe5-86ad18e30c3d",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste",
});
