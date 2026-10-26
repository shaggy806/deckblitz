import { defineCard } from "../define.js";

/** Carnivore, a 3/1 red Beast creature token (Tooth and Claw). Keyed
 * " Token" and named by `tokenName` (rule 111.4). */
export default defineCard({
  name: "Carnivore Token",
  tokenName: "Carnivore",
  art: "8437b125-6057-4d17-9f2c-28ea56553f84",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 1,
  text: "",
});
