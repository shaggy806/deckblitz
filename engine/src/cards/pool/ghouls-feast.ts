import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghoul's Feast",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +X/+0 until end of turn, where X is the number of creature cards in your graveyard.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: { countInGraveyard: { type: "creature", ownedBy: "you" } },
    toughness: 0,
    duration: "end-of-turn",
  },
});
