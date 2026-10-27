import { defineCard } from "../define.js";

// EDHREC rank 17503. Karona, False God's shape, +X/+X.

export default defineCard({
  name: "Tribal Unity",
  manaCost: "{X}{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Creatures of the creature type of your choice get +X/+X until end of turn.",
  targets: [],
  effect: {
    kind: "choose-creature-type",
    then: {
      kind: "modify-pt-all",
      filter: { type: "creature", subtype: "$chosen" },
      power: "x",
      toughness: "x",
      duration: "end-of-turn",
    },
  },
});
