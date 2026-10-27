import { defineCard } from "../define.js";

// Onslaught. EDHREC rank 29450. Witch's Vengeance's shape at +0/+4.

export default defineCard({
  name: "Defensive Maneuvers",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures of the creature type of your choice get +0/+4 until end of turn.",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", subtype: "$chosen" },
      power: 0,
      toughness: 4,
      duration: "end-of-turn",
    },
  },
});
