import { defineCard } from "../define.js";

/**
 * The back face of the Incubator token (rule 111.10i): a 0/0 colorless
 * Phyrexian artifact creature named "Phyrexian Token", as big as the +1/+1
 * counters it incubated with.
 */
export default defineCard({
  name: "Phyrexian Token",
  art: "https://cards.scryfall.io/art_crop/back/2/c/2c5ed737-657b-43bf-b222-941da7579a4a.jpg",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian"],
  power: 0,
  toughness: 0,
  text: "",
  faces: ["Incubator Token", "Phyrexian Token"],
  transform: true,
});
