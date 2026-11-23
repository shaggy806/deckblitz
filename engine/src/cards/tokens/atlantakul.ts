import { defineCard } from "../define.js";
import { annihilator } from "../helpers.js";

/**
 * Spaghetti Junction's token — "Atlantakul, a legendary 20/20 colorless
 * Eldrazi creature token with annihilator 2". A named legendary token (Karox
 * Bladewing's shape), so the legend rule applies to a second one. No token
 * printing exists.
 */
export default defineCard({
  name: "Atlantakul",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 20,
  toughness: 20,
  text: "Annihilator 2 (Whenever this creature attacks, defending player sacrifices two permanents of their choice.)",
  triggered: [annihilator(2)],
});
