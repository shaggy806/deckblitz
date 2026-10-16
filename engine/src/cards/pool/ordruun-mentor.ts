import { defineCard } from "../define.js";

// EDHREC rank 25630.
//
// Mentor is Legion Warboss's triggered ability: the target's power is checked
// against this creature's as the trigger goes on the stack and again as it
// resolves (a target no longer smaller is illegal — the rulings). "Whenever
// you attack a player" fires once per player attacked (`attacks-player`), and
// its target is a creature attacking that player itself (Echoing Assault's
// `attacking: "trigger-player"`), not a planeswalker of theirs.

const MENTOR_TEXT =
  "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)";
const ATTACK_TEXT =
  "Whenever you attack a player, target creature that's attacking that player gains first strike until end of turn.";

export default defineCard({
  name: "Ordruun Mentor",
  manaCost: "{2}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Soldier"],
  power: 3,
  toughness: 2,
  text: `${MENTOR_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", attacking: true, power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: MENTOR_TEXT,
    },
    {
      trigger: { on: "attacks-player", who: "you", defender: "any" },
      targets: [{ kind: "permanent", attacking: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
