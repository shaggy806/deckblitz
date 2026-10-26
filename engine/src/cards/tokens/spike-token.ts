import { defineCard } from "../define.js";

/** 1/1 green Spike — Spike Breeder's token. Never printed as a token card
 * (a Scryfall token search for Spike finds none, 2026-10-26), so no art pin. */
export default defineCard({
  name: "Spike Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spike"],
  power: 1,
  toughness: 1,
  text: "",
});
