import { defineCard } from "../define.js";

/** 1/1 colorless Human — The Cookout Creator's tokens. No token printing of it exists. */
export default defineCard({
  name: "Human Token (Colorless)",
  tokenName: "Human Token",
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
});
