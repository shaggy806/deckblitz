import { defineCard } from "../define.js";

// The Raven Man's token: a 1/1 black Bird with flying and "This token can't block."
export default defineCard({
  name: "1/1 Black Bird Token (The Raven Man)",
  art: "8dce95d5-2ae7-4bd9-92f4-1cb3bed5f733",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis token can't block.",
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This token can't block." }],
});
