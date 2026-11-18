import { defineCard } from "../define.js";

// EDHREC rank 16021.
//
// Each attacking creature counts the nonbasic lands of its own defending
// player — the player it attacks, or the controller of the planeswalker or
// the protector of the battle it attacks (rules 508.5, 508.5a) — as this
// resolves. The attackers are the ones attacking then; a creature that starts
// attacking later doesn't get the bonus (the ruling).

export default defineCard({
  name: "Mercadia's Downfall",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Each attacking creature gets +1/+0 until end of turn for each nonbasic land defending player controls.",
  effect: {
    kind: "for-each-permanent",
    filter: { type: "creature", attacking: true },
    effect: {
      kind: "modify-pt",
      target: 0,
      power: { countOf: { type: "land", notSupertype: "basic", controlledByRef: { defendingPlayerOf: 0 } } },
      toughness: 0,
      duration: "end-of-turn",
    },
  },
});
