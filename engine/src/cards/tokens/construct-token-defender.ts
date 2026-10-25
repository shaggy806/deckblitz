import { defineCard } from "../define.js";

// A 1/1 colorless Construct artifact creature with defender — Flamewright's
// token (the pool's "Construct Token" is Urza's Saga's 0/0).
export default defineCard({
  name: "Construct Token (Defender)",
  art: "7c82af53-2de8-4cd6-84bf-fb39d2693de2",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  keywords: ["defender"],
  text: "Defender",
});
