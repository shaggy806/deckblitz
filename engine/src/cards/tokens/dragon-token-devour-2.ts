import { defineCard } from "../define.js";

/** 1/1 red and green Dragon with flying and devour 2 — Dragon Broodmother's token. */
export default defineCard({
  name: "Dragon Token (Flying, Devour 2)",
  tokenName: "Dragon Token",
  art: "0bb628da-a02f-4d3e-b919-0c03821dd5f2",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: "Flying, devour 2",
});
