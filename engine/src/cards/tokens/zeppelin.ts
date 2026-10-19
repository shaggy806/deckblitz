import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

/** Lita, Mechanical Engineer's token — a 5/5 colorless Vehicle artifact
 * named Zeppelin, with flying and crew 3. Not legendary. */
export default defineCard({
  name: "Zeppelin",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying, crew 3",
  activated: [crew(3)],
});
