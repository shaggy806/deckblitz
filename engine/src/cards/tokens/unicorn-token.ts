import { defineCard } from "../define.js";

// A vanilla 2/2 white Unicorn (Blessed Sanctuary). No Unicorn token printing in
// the Oracle snapshot (checked 2026-10-28), so no art to pin.
export default defineCard({
  name: "Unicorn Token",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 2,
  text: "",
});
