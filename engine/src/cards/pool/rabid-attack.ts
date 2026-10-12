import { defineCard } from "../define.js";

// EDHREC rank 12336. Any number of targets (Eerie Interlude's group), each
// pumped and given the dies trigger until end of turn (Clavileño's granted
// "When this creature dies, draw a card" — its controller draws).
const TEXT =
  'Until end of turn, any number of target creatures you control each get +1/+0 and gain "When this creature dies, draw a card."';

export default defineCard({
  name: "Rabid Attack",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: TEXT,
  targets: [{ kind: "any-number", of: "creature-you-control" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
        {
          kind: "grant-triggered",
          target: 0,
          duration: "end-of-turn",
          ability: {
            trigger: { on: "dies", who: "self" },
            targets: [],
            effect: { kind: "draw", amount: 1 },
            resolve: null,
            text: "When this creature dies, draw a card.",
          },
        },
      ],
    },
  },
});
