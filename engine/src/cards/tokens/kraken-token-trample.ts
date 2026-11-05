import { defineCard } from "../define.js";

// A 1/1 blue Kraken with trample (Invasion of Segovia's two).
export default defineCard({
  name: "Kraken Token (Trample)",
  art: "cb727dec-dd82-4072-b2ec-a4e31b58752f",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Kraken"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample",
});
