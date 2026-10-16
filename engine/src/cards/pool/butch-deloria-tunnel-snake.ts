import { defineCard } from "../define.js";

// EDHREC rank 11829. Fallout.
//
// Rulings:
//   [2024-03-08] A permanent that's both a Rogue and a Snake is counted only once for Butch
//     DeLoria's second ability.
//
// "Each other Rogue and/or Snake you control" is one count over permanents
// with either subtype (`subtypes` is an OR, so a Rogue Snake counts once),
// Butch left out (Muxus's shape), read as the trigger resolves. The menace
// counter and the Rogue type stay: neither has a duration.
const ATTACK_TEXT =
  "Tunnel Snakes Rule! — Whenever Butch DeLoria attacks, it gets +1/+1 until end of turn for each other Rogue and/or Snake you control.";
const PUMP_TEXT = "{1}{B}: Put a menace counter on another target creature. It becomes a Rogue in addition to its other types.";
const OTHERS = { countOf: { subtypes: ["Rogue", "Snake"], controlledBy: "you" }, excludeSelf: true } as const;

export default defineCard({
  name: "Butch DeLoria, Tunnel Snake",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ATTACK_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "menace", amount: 1 },
          { kind: "add-types", target: 0, addSubtypes: ["Rogue"], duration: "permanent" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: OTHERS, toughness: OTHERS, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
