import { defineCard } from "../define.js";

/** 3/1 red Elemental with trample and haste — Force of Rage's token. */
export default defineCard({
  name: "3/1 Red Elemental Token",
  art: "addc39de-db64-41d8-9185-67a09d3e326d",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 1,
  keywords: ["trample", "haste"],
  text: "Trample, haste",
});
