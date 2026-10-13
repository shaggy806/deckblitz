import { defineCard } from "../define.js";
import { evolve } from "../helpers.js";

// EDHREC rank 7168.

const DRAW_TEXT =
  "Whenever a creature you control with a counter on it deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Ray Fillet, Wave Warrior",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Fish", "Mutant"],
  power: 0,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\nEvolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\n${DRAW_TEXT}`,
  triggered: [
    evolve(),
    {
      trigger: {
        on: "deals-combat-damage-to-player",
        who: "you-control",
        filter: { type: "creature", counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
