import { defineCard } from "../define.js";

// EDHREC rank 10410.
// Makes Treasure → "Treasure Token".
//
// The Treasure trigger is a batched damage trigger over goaded creatures —
// whoever controls them, goaded by anyone (rule 701.15b) — once per opponent
// of yours they dealt combat damage to in one damage event.
const ATTACK_TEXT =
  "Whenever you attack, goad target creature an opponent controls. It can't block this turn. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)";
const TREASURE_TEXT =
  "Whenever one or more goaded creatures deal combat damage to one of your opponents, create a Treasure token.";

export default defineCard({
  name: "Puppet Master, String Puller",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Villain"],
  power: 2,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${TREASURE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["cant-block"] },
        ],
      },
      resolve: null,
      text: "Whenever you attack, goad target creature an opponent controls. It can't block this turn.",
    },
    {
      trigger: {
        on: "deals-damage-batch",
        who: "any",
        filter: { type: "creature", goaded: true },
        to: "opponent",
        combat: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
  ],
});
