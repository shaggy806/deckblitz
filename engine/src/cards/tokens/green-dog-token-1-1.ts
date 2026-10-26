import { defineCard } from "../define.js";

// A 1/1 green Dog — Mongrel Pack's token. Named with its size and colour like
// "1/1 White Dog Token". Mongrel Pack lists no token printing (the Oracle
// snapshot, 2026-10-26), so it pins no art.
export default defineCard({
  name: "1/1 Green Dog Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 1,
  toughness: 1,
});
