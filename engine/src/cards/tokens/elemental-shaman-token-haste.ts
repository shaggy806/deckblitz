import { defineCard } from "../define.js";

// The 3/1 red Elemental Shaman token *with haste* (Hostility): the haste is
// part of the token as created, so a copy of it has haste too (rule 707.2).
// The vanilla one is `elemental-shaman-token.ts`.

export default defineCard({
  name: "Elemental Shaman Token (Haste)",
  tokenName: "Elemental Shaman Token",
  art: "a271bdf3-2868-425d-987c-4ce272152a2f",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 3,
  toughness: 1,
  keywords: ["haste"],
  text: "Haste",
});
