import { defineCard } from "../define.js";

// EDHREC rank 3404. Blood Moon on a body: rule 305.7 — the lands lose their
// other land types and rules-text abilities and gain "{T}: Add {R}".

export default defineCard({
  name: "Magus of the Moon",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Nonbasic lands are Mountains.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", notSupertype: "basic" } },
      setSubtypes: ["Mountain"],
      text: "Nonbasic lands are Mountains.",
    },
  ],
});
