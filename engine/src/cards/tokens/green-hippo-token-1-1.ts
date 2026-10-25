import { defineCard } from "../define.js";

// A 1/1 green Hippo — Phelddagrif's token. Named with its size so it doesn't
// collide with the 3/3 "Hippo Token". Scryfall lists no printing of it (the
// Oracle snapshot, 2026-10-25), so it has no art pin.
export default defineCard({
  name: "1/1 Green Hippo Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hippo"],
  power: 1,
  toughness: 1,
});
