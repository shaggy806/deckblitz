import { defineCard } from "../define.js";

/** 1/1 blue Faerie with flying and "This token can block only creatures with flying" — Into the
 * Fae Court's token. */

export default defineCard({
  name: "Faerie Token (Into the Fae Court)",
  art: "0f9a993f-1f2b-4b17-b415-e975b7873e18",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature can block only creatures with flying.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
  ],
});
