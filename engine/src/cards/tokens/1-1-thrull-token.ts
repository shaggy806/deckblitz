import { defineCard } from "../define.js";

// A vanilla 1/1 black Thrull (Sarpadian Empires, Vol. VII). "Thrull Token" is
// the 0/1 one; the engine keys tokens by name, so this one has its own key
// and gets its in-game name (rule 111.4) from `tokenName`.
export default defineCard({
  name: "1/1 Thrull Token",
  tokenName: "Thrull Token",
  art: "dc5604c5-4fff-4bb6-bf6d-69027e4eeb21",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 1,
  toughness: 1,
  text: "",
});
