import { defineCard } from "../define.js";

// EDHREC rank 18075.
//
// "Attacked with three or more Merfolk" asks about each creature as it was
// declared (`turn-history`'s `attackers`, each one once).

export default defineCard({
  name: "Deepway Navigator",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: "Flash\nWhen this creature enters, untap each other Merfolk you control.\nAs long as you attacked with three or more Merfolk this turn, Merfolk you control get +1/+0.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "untap-all", filter: { subtype: "Merfolk", controlledBy: "you" }, exceptSource: true },
      resolve: null,
      text: "When this creature enters, untap each other Merfolk you control.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Merfolk", controlledBy: "you" } },
      condition: { kind: "turn-history", what: "attackers", filter: { subtype: "Merfolk" }, atLeast: 3 },
      grantPt: [1, 0],
      text: "As long as you attacked with three or more Merfolk this turn, Merfolk you control get +1/+0.",
    },
  ],
});
