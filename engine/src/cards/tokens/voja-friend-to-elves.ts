import { defineCard } from "../define.js";

/**
 * Tolsimir, Friend to Wolves's token: "Voja, Friend to Elves, a legendary 3/3
 * green and white Wolf creature token". A named legendary token (Angelo's
 * shape), so the legend rule (704.5j) applies to a second one — and not to
 * Tolsimir Wolfblood's "Voja", a different name (the ruling).
 */
export default defineCard({
  name: "Voja, Friend to Elves",
  art: "39475e91-1e71-4546-ae4a-47ea66e47536",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 3,
});
