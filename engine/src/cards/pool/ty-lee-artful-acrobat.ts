import { defineCard } from "../define.js";

// EDHREC rank 11573. The {1} pays for a reflexive trigger that targets as it
// goes on the stack (rule 603.12) — Taeko, the Patient Avalanche's shape.

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const ATTACK_TEXT = "Whenever Ty Lee attacks, you may pay {1}. When you do, target creature can't block this turn.";

export default defineCard({
  name: "Ty Lee, Artful Acrobat",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Performer"],
  power: 3,
  toughness: 2,
  text: `${PROWESS_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to have target creature not block this turn?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature"],
          effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          text: "When you do, target creature can't block this turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
