import { defineCard } from "../define.js";

/** 0/1 colorless Prism artifact creature — Diamond Kaleidoscope's token. No
 * token printing exists (the Oracle snapshot lists none), so it has no art. */
export default defineCard({
  name: "Prism Token",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Prism"],
  power: 0,
  toughness: 1,
});
