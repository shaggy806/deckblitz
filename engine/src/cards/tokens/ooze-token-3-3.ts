import { defineCard } from "../define.js";

// A vanilla 3/3 green Ooze (Inexorable Blob). "Ooze Token" is the 2/2 one; the
// engine keys tokens by name, so this one needs its own key, and gets its
// in-game name (rule 111.4) from `tokenName`.
export default defineCard({
  name: "3/3 Ooze Token",
  tokenName: "Ooze Token",
  art: "623a7905-3a10-4d23-96fa-4960cac8f4e3",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 3,
  toughness: 3,
  text: "",
});
