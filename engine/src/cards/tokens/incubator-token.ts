import { defineCard } from "../define.js";

/**
 * The Incubator token (rule 111.10i — incubate, 701.53): a double-faced
 * token whose front is a colorless Incubator artifact with "{2}: Transform
 * this token." and whose back is a 0/0 colorless Phyrexian artifact creature,
 * "Phyrexian Token". The `incubate` effect makes it with its +1/+1 counters.
 */
export default defineCard({
  name: "Incubator Token",
  art: "https://cards.scryfall.io/art_crop/front/2/c/2c5ed737-657b-43bf-b222-941da7579a4a.jpg",
  colors: [],
  types: ["artifact"],
  subtypes: ["Incubator"],
  text: "{2}: Transform this token.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{2}: Transform this token.",
    },
  ],
  faces: ["Incubator Token", "Phyrexian Token"],
  transform: true,
});
