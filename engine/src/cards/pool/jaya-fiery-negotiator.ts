import { defineCard } from "../define.js";

// EDHREC rank 11844.
// Makes Monk → use "Monk Token (Crescent Island Temple)".
// The −2 sets up a delayed triggered ability for the rest of the turn (rule
// 603.7c) that fires each time you declare attackers, whether or not Jaya is
// still there (the ruling); it acts on the −2's own target, and Jaya — as
// she last existed, if she's gone — deals the damage. The count is of the
// creatures attacking as it resolves. The emblem copies any red instant or
// sorcery spell, targets or not, the copies resolving first (the rulings).
const PLUS_TEXT = "+1: Create a 1/1 red Monk creature token with prowess.";
const IMPULSE_TEXT = "−1: Exile the top two cards of your library. Choose one of them. You may play that card this turn.";
const ATTACK_TEXT =
  "−2: Choose target creature an opponent controls. Whenever you attack this turn, Jaya deals damage equal to the number of attacking creatures to that creature.";
const EMBLEM_TEXT =
  "Whenever you cast a red instant or sorcery spell, copy it twice. You may choose new targets for the copies.";
const ULT_TEXT = `−8: You get an emblem with "${EMBLEM_TEXT}"`;

export default defineCard({
  name: "Jaya, Fiery Negotiator",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jaya"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${IMPULSE_TEXT}\n${ATTACK_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Monk Token (Crescent Island Temple)", count: 1 },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn", choose: 1 },
      resolve: null,
      text: IMPULSE_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "attack-with", who: "you", atLeast: 1 } },
        effect: {
          kind: "damage",
          target: 0,
          amount: { countOf: { type: "creature", attacking: true } },
        },
        text: "Whenever you attack this turn, Jaya deals damage equal to the number of attacking creatures to that creature.",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        triggered: [
          {
            trigger: {
              on: "cast-spell",
              who: "you",
              filter: { colors: ["R"], typesAnyOf: ["instant", "sorcery"] },
            },
            targets: [],
            effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: 2 },
            resolve: null,
            text: EMBLEM_TEXT,
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
