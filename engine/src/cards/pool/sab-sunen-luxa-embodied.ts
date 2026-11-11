import { defineCard } from "../define.js";

// Aetherdrift. EDHREC rank 5406.
//
// "Counters" is every kind together (a stun or shield counter counts). The
// trigger reads the count as it resolves, after its own counter; if Sab-Sunen
// has left by then, as it last was on the battlefield (rule 608.2h).
const COMBAT_TEXT = "Sab-Sunen can't attack or block unless it has an even number of counters on it. (Zero is even.)";
const MAIN_TEXT =
  "At the beginning of your first main phase, put a +1/+1 counter on Sab-Sunen. Then if it has an odd number of counters on it, draw two cards.";

export default defineCard({
  name: "Sab-Sunen, Luxa Embodied",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God"],
  power: 6,
  toughness: 6,
  keywords: ["reach", "trample", "indestructible"],
  text: `Reach, trample, indestructible\n${COMBAT_TEXT}\n${MAIN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", parity: "odd" },
      restrictions: ["cant-attack", "cant-block"],
      text: COMBAT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "conditional", condition: { kind: "self-counters", parity: "odd" }, then: { kind: "draw", amount: 2 } },
        ],
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
});
