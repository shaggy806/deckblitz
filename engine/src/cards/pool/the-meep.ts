import { defineCard } from "../define.js";

// X is the sacrificed creature's mana value as it last existed. "Creatures
// you control" are fixed as it resolves (rule 611.2c), each getting base
// power and toughness X/X (layer 7b) until end of turn.
const ATTACK_TEXT =
  "Whenever The Meep attacks, you may sacrifice another creature. If you do, creatures you control have base power and toughness X/X until end of turn, where X is the sacrificed creature's mana value.";
const X = { manaValueOf: { paid: "sacrificed" } } as const;

export default defineCard({
  name: "The Meep",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien"],
  power: 0,
  toughness: 4,
  text: `Ward—Pay 3 life.\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { payLife: 3 } },
      resolve: null,
      text: "Ward—Pay 3 life.",
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "become",
          filter: { type: "creature", controlledBy: "you" },
          power: X,
          toughness: X,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
