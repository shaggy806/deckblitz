import { defineCard } from "../define.js";

// EDHREC rank 18485. "Except it's 7/7" is a copy exception (rule 707.9b): a
// base P/T set as a copiable value, after any copied characteristic-defining
// ability, so a copy of a Nightmare stays 7/7 (the ruling), while a later
// "becomes N/N" effect still wins over it.
export default defineCard({
  name: "Quicksilver Gargantuan",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 7,
  toughness: 7,
  text: "You may have this creature enter as a copy of any creature on the battlefield, except it's 7/7.",
  copyOnEnter: { filter: { type: "creature" }, except: { basePt: [7, 7] } },
});
