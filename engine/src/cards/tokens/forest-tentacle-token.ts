import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

/**
 * Verdant Kraken's token: a 3/3 green Forest Tentacle land creature. Its
 * "{T}: Add {G}" is the Forest type's own (rule 305.6), and as a creature it
 * can't be tapped for it while summoning sick (rule 302.6). Not basic (the
 * ruling). Forest Dryad Token's shape.
 */
export default defineCard({
  name: "Forest Tentacle Token",
  art: "fc924972-5014-45d1-9676-6a76d862b205",
  colors: ["G"],
  types: ["land", "creature"],
  subtypes: ["Forest", "Tentacle"],
  power: 3,
  toughness: 3,
  activated: [manaTapAbility("G")],
});
