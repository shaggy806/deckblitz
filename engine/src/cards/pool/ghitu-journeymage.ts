import { defineCard } from "../define.js";

// EDHREC rank 21374.
//
// Rulings:
//   [2018-04-27] Ghitu Journeymage's triggered ability doesn't deal more damage if you control
//     more than one other Wizard.
//   [2018-04-27] Ghitu Journeymage's ability doesn't trigger if you don't control another Wizard
//     immediately after it enters the battlefield. If it does trigger but you don't control
//     another Wizard as it resolves, it does nothing.
//
// Turret Ogre's intervening-if (rule 603.4), checked as it triggers and again
// as it resolves.

const TEXT = "When this creature enters, if you control another Wizard, this creature deals 2 damage to each opponent.";

export default defineCard({
  name: "Ghitu Journeymage",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Wizard" }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: TEXT,
    },
  ],
});
