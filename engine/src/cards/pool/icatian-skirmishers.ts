import { defineCard } from "../define.js";

// EDHREC rank 23987.

export default defineCard({
  name: "Icatian Skirmishers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike", "banding"],
  text: "First strike; banding (Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking.)\nWhenever this creature attacks, all creatures banded with it gain first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", bandedWithSource: true },
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature attacks, all creatures banded with it gain first strike until end of turn.",
    },
  ],
});
