import { defineCard } from "../define.js";

// EDHREC rank 6974.
//
// "Grothama" in the granted trigger is the permanent whose static grants it
// (rule 201.5a — `"granter"`), and the attacking creature's controller
// chooses whether it fights (the ruling). The fight happens as the trigger
// resolves, before blockers; once Grothama has left the battlefield, or the
// attacker has, no damage is dealt (rule 701.14b) — "once Grothama has been
// defeated, any remaining attacking creatures can't fight it".
//
// The leaves trigger reads the journal's damage entries to Grothama in the
// stint that left (rule 400.7), each counted for the player who controlled the
// source as it dealt the damage — any damage, not only a fight's (Blaze's
// ruling). Each player draws their own count, all at once.
//
// Rulings:
//   [2018-06-08] Grothama's last ability triggers even if it dies without being fought by attacking
//     creatures. For example, if you use Blaze to deal 10 damage to Grothama, you draw ten cards.
//   [2018-06-08] The controller of the attacking creature chooses whether that creature fights
//     Grothama.
//   [2018-06-08] Creatures fight Grothama before blockers are declared. Any creatures that die in
//     the fight can't be blocked. Any attacking creatures that survive the fight will still be
//     attacking, may be blocked as normal, and will deal damage to the player or planeswalker they're
//     attacking if unblocked.
//   [2018-06-08] If multiple creatures attack, each desired fight happens individually in the order
//     the attacking players choose. Once Grothama has been defeated, any remaining attacking
//     creatures can't fight it.

const GRANTED = "Whenever this creature attacks, you may have it fight Grothama, All-Devouring.";
const STATIC_TEXT = `Other creatures have "${GRANTED}"`;
const LEAVES_TEXT =
  "When Grothama leaves the battlefield, each player draws cards equal to the amount of damage dealt to Grothama this turn by sources they controlled.";

export default defineCard({
  name: "Grothama, All-Devouring",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 10,
  toughness: 8,
  text: `${STATIC_TEXT}\n${LEAVES_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" }, excludeSelf: true },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "may",
            prompt: "Have this creature fight Grothama, All-Devouring?",
            effect: { kind: "fight", a: "source", b: "granter" },
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "draw",
        who: "each-player",
        amount: { damageDealtThisTurn: true, who: "each", to: "source" },
      },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
