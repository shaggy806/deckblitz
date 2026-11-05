import { defineCard } from "../define.js";

// A 5/4 red and green Dragon Spirit creature token with "When this token deals
// damage, sacrifice it."
const TEXT = "When this token deals damage, sacrifice it.";

export default defineCard({
  name: "Dragon Spirit Token (Sacrifice When It Deals Damage)",
  tokenName: "Dragon Spirit Token",
  art: "b997ace9-ea21-437c-b9cd-128d02f58fa7",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
