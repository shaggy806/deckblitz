import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Lake-town Mariners' Adventure. Exactly two targets (Ghostly Flicker's
// shape), back under their owner's control (Displace's). A token exiled this
// way ceases to exist and doesn't return (the ruling).

export default defineCard({
  name: "Gone Fishing",
  art: "https://cards.scryfall.io/art_crop/back/4/2/4202a678-a5f4-47f9-9c18-e88ab9ad20a4.jpg",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Adventure"],
  text: "Exile two target creatures and/or lands you control, then return them to the battlefield under their owner's control.",
  targets: distinctTargets(2, {
    kind: "permanent",
    whose: "you",
    filter: { typesAnyOf: ["creature", "land"] },
  }),
  effect: { kind: "flicker", target: [0, 1] },
  faces: ["Lake-town Mariners", "Gone Fishing"],
  adventure: true,
});
