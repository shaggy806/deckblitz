import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

/**
 * Setzer, Wandering Gambler's token — a *named legendary* Vehicle called The
 * Blackjack (Karox Bladewing's shape), so the legend rule applies to two of
 * them.
 */
export default defineCard({
  name: "The Blackjack",
  art: "af39ce29-47bb-42bf-8d3d-224bdce96a83",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying, crew 2",
  activated: [crew(2)],
});
