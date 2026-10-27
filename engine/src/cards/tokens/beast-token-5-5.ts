import { defineCard } from "../define.js";

// A vanilla 5/5 green Beast — One Dozen Eyes' token. ("Beast Token" is the
// 4/4; the engine keys tokens by name so this needs its own.) No token
// printing in the Oracle snapshot, so no art to pin.
export default defineCard({
  name: "5/5 Beast Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
});
