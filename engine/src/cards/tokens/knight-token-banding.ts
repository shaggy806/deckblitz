import { defineCard } from "../define.js";

// A 1/1 white Knight with banding — Errand of Duty's.
export default defineCard({
  name: "Knight Token (banding)",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Knight"],
  power: 1,
  toughness: 1,
  keywords: ["banding"],
});
