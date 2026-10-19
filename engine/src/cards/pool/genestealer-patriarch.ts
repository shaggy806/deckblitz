import { defineCard } from "../define.js";

// EDHREC rank 15701.
//
// Rulings:
//   [2022-10-07] If you control more than one Genestealer Patriarch as a creature with an infection
//     counter on it dies, each one's ability will trigger, and you will make two tokens that are
//     copies of it.
//   [2022-10-07] The token copies the creature as it last existed on the battlefield before it
//     died, not as it exists in the graveyard.
//   [2022-10-07] The token copies exactly what was printed on the original creature and nothing
//     else (unless that creature is copying something else). It doesn't copy whether that creature
//     was tapped or untapped, whether it had any counters on it or Auras or Equipment attached to
//     it, or any non-copy effects that had changed its power, toughness, types, color, or so on.
//
// Children of the Cult watches any creature, whoever controls it, with an
// infection counter on it as it last existed; the copy is Nightmare
// Shepherd's, of the trigger object.

const KISS_TEXT =
  "Genestealer's Kiss — Whenever this creature attacks, put an infection counter on target creature defending player controls.";
const CULT_TEXT =
  "Children of the Cult — Whenever a creature with an infection counter on it dies, you create a token that's a copy of that creature, except it's a Tyranid in addition to its other types.";

export default defineCard({
  name: "Genestealer Patriarch",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Tyranid"],
  power: 4,
  toughness: 4,
  text: `${KISS_TEXT}\n${CULT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "add-counter", target: 0, counter: "infection", amount: 1 },
      resolve: null,
      text: KISS_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", counters: { kind: "infection", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: {
        kind: "create-token-copy",
        of: "trigger-object",
        count: 1,
        who: "you",
        exceptions: { addSubtypes: ["Tyranid"] },
      },
      resolve: null,
      text: CULT_TEXT,
    },
  ],
});
