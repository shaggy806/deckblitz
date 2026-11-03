import { defineCard } from "../define.js";

/** Stangg's token: "Stangg Twin, a legendary 3/4 red and green Human Warrior
 * creature token". */
export default defineCard({
  name: "Stangg Twin",
  art: "eba90d37-d7ac-4097-a04d-1f27e4c9e5de",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 4,
});
