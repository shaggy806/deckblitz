import { defineCard } from "../define.js";

// EDHREC rank 10984.
//
// Rulings:
//   [2018-04-27] Adeliz's last ability affects only Wizards you control at the time it resolves,
//     including Adeliz itself. Creatures you begin to control later in the turn or that become
//     Wizards later in the turn won't get +1/+1.
//   [2018-04-27] Adeliz's last ability resolves before the spell that caused it to trigger. It
//     resolves even if that spell is countered.

const TRIGGER_TEXT = "Whenever you cast an instant or sorcery spell, Wizards you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Adeliz, the Cinder Wind",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", subtype: "Wizard", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
