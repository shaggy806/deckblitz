import { defineCard } from "../define.js";

/** Tatsumasa, the Dragon's Fang's 5/5 blue Dragon Spirit creature token with
 * flying (Oracle names no printing of it). */
export default defineCard({
  name: "Dragon Spirit Token (Tatsumasa)",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying",
});
