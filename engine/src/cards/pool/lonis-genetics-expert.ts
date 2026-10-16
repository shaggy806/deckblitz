import { defineCard } from "../define.js";
import { evolve, investigate } from "../helpers.js";

// EDHREC rank 11174. Ravnica: Clue Edition (CLU).
//
// "Investigate that many times" is the number of +1/+1 counters put on Lonis
// in that one event. Any Clue sacrificed for any reason counts (the rulings).
const EVOLVE_TEXT =
  "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)";
const COUNTERS_TEXT = "Whenever one or more +1/+1 counters are put on Lonis, investigate that many times.";
const CLUE_TEXT = "Whenever you sacrifice a Clue, put a +1/+1 counter on another target creature you control.";

export default defineCard({
  name: "Lonis, Genetics Expert",
  manaCost: "{1}{G/U}{G/U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Elf", "Detective"],
  power: 1,
  toughness: 2,
  text: `${EVOLVE_TEXT}\n${COUNTERS_TEXT}\n${CLUE_TEXT}`,
  triggered: [
    evolve(),
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [],
      effect: investigate({ triggerValue: true }),
      resolve: null,
      text: COUNTERS_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Clue" } },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CLUE_TEXT,
    },
  ],
});
