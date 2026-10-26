import { defineCard } from "../define.js";

// EDHREC rank 13010.
//
// Rulings:
//   [2011-09-22] While Basandra, Battle Seraph is on the battlefield, players can't cast any
//     spells during the combat phase, including permanent spells with flash.
//   [2011-09-22] Players may still activate abilities during combat.
const COMBAT_TEXT = "Players can't cast spells during combat.";
const ATTACK_TEXT = "{R}: Target creature attacks this turn if able.";

export default defineCard({
  name: "Basandra, Battle Seraph",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${COMBAT_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-structure", duringCombat: true },
      prohibits: { who: "each-player", spells: true },
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["must-attack"] },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
