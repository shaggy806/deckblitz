import { defineCard } from "../define.js";

/**
 * Tomb of Annihilation's last room, Cradle of the Death God — "Create The
 * Atropal, a legendary 4/4 black God Horror creature token with deathtouch."
 * A named token whose name collides with no card, so it's keyed by that name
 * and the legend rule reads "The Atropal".
 */
export default defineCard({
  name: "The Atropal",
  art: "65f8e40f-fb5e-4ab8-add3-a8b87e7bcdd9",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Horror"],
  power: 4,
  toughness: 4,
  keywords: ["deathtouch"],
  text: "Deathtouch",
});
