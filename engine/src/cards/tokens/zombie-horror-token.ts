import { defineCard } from "../define.js";

// A black Zombie Horror printed 0/0 (X/X): its size comes from
// `create-token`'s `basePt` as it's made (Corpseweft).
export default defineCard({
  name: "Zombie Horror Token",
  art: "533c41ab-d9ee-4817-a982-41d4da6fa9ad",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 0,
  toughness: 0,
  text: "",
});
