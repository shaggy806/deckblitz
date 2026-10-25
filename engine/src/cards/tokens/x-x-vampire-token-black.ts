import { defineCard } from "../define.js";

/** A black Vampire creature token with no abilities, its P/T set as it's made
 * (`create-token`'s `basePt` — Kalitas, Bloodchief of Ghet). */
export default defineCard({
  name: "X/X Vampire Token (Black)",
  art: "969eff58-d91e-49e2-a1e1-8f32b4598810",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 0,
  toughness: 0,
});
