import { defineCard } from "../define.js";

// EDHREC rank 18612.

export default defineCard({
  name: "Dryad Sophisticate",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 2,
  toughness: 1,
  text: "Nonbasic landwalk (This creature can't be blocked as long as defending player controls a nonbasic land.)",
  static: [
    {
      affects: { scope: "self" },
      landwalk: { type: "land", notSupertype: "basic" },
      text: "Nonbasic landwalk",
    },
  ],
});
