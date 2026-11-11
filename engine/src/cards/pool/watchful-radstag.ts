import { defineCard } from "../define.js";
import { evolve } from "../helpers.js";

// EDHREC rank 6427. Fallout (PIP).
//
// It "evolves" when its evolve ability resolves and puts a +1/+1 counter on
// it (rule 702.100b): once however many counters a replacement makes of the
// one, and not at all when none is put (the rulings). The token copies the
// card, not its counters, and has both abilities itself.
const COPY = "Whenever this creature evolves, create a token that's a copy of it.";

export default defineCard({
  name: "Watchful Radstag",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk", "Mutant"],
  power: 2,
  toughness: 2,
  text: `Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\n${COPY}`,
  triggered: [
    evolve(),
    {
      trigger: { on: "evolves", who: "self" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1 },
      resolve: null,
      text: COPY,
    },
  ],
});
