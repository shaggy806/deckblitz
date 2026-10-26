import { defineCard } from "../define.js";

/** 1/1 blue Faerie, flying, blocks only fliers — Cloudseeder's token. */
export default defineCard({
  name: "Cloud Sprite Token",
  art: "4a2144f2-d4be-419e-bfca-116cedfdf18b",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nCloud Sprite can block only creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "Cloud Sprite can block only creatures with flying.",
    },
  ],
});
