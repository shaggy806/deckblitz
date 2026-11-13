import { defineCard } from "../define.js";
import { evolve } from "../helpers.js";

// EDHREC rank 15133. Gatecrash. "Whenever this creature evolves" is
// `on: "evolves"` (Watchful Radstag): only its evolve ability resolving with a
// counter put on, once however many counters (the rulings).
const EVOLVES =
  "Whenever this creature evolves, put a +1/+1 counter on each other creature you control with a +1/+1 counter on it.";

export default defineCard({
  name: "Renegade Krasis",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast", "Mutant"],
  power: 3,
  toughness: 2,
  text: `Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\n${EVOLVES}`,
  triggered: [
    evolve(),
    {
      trigger: { on: "evolves", who: "self" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        counter: "+1/+1",
        amount: 1,
        exceptSource: true,
      },
      resolve: null,
      text: EVOLVES,
    },
  ],
});
