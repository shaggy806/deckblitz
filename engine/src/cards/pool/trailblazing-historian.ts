import { defineCard } from "../define.js";

// EDHREC rank 19064.

export default defineCard({
  name: "Trailblazing Historian",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 3,
  keywords: ["haste"],
  text: "Haste\n{T}: Another target creature gains haste until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Another target creature gains haste until end of turn.",
    },
  ],
});
