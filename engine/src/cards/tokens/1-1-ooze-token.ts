import { defineCard } from "../define.js";

// A vanilla 1/1 green Ooze (Mitotic Slime's second generation). "Ooze Token"
// is the 2/2 one; the engine keys tokens by name, so this one has its own key
// and gets its in-game name (rule 111.4) from `tokenName`.
export default defineCard({
  name: "1/1 Ooze Token",
  tokenName: "Ooze Token",
  art: "26e205aa-6d29-4067-8b20-f3da72511b21",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 1,
  toughness: 1,
  text: "",
});
