import { defineCard } from "../define.js";

// A vanilla 3/3 green Centaur (Rampage of the Clans). "Centaur Token" is the
// one with protection from black; the engine keys tokens by name, so this one
// needs its own key, and gets its in-game name (rule 111.4) from `tokenName`.
export default defineCard({
  name: "3/3 Centaur Token",
  tokenName: "Centaur Token",
  art: "5fc993a7-a1ce-4403-a0a0-2afc9f9eca42",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur"],
  power: 3,
  toughness: 3,
  text: "",
});
