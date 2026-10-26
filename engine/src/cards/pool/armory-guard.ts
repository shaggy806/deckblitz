import { defineCard } from "../define.js";

// EDHREC rank 27123.
//
// Rulings:
//   [2012-10-01] Vigilance only matters when Armory Guard is being declared as an attacking
//     creature. If Armory Guard is already attacking, losing control of your only Gate won't cause
//     Armory Guard to become tapped or to leave combat.

export default defineCard({
  name: "Armory Guard",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 2,
  toughness: 5,
  text: "This creature has vigilance as long as you control a Gate.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 1 },
      grantKeywords: ["vigilance"],
      text: "This creature has vigilance as long as you control a Gate.",
    },
  ],
});
