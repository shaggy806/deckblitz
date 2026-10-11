import { defineCard } from "../define.js";

// EDHREC rank 11237. Marvel Super Heroes Commander.
//
// "Attacking modified creatures you control" — War Machine itself included —
// are the ones that match as the trigger resolves (rule 611.2c: the set is
// fixed then; one modified afterwards doesn't gain double strike). Modified
// is rule 700.9 (the `modified` filter): a counter, Equipment, or an Aura
// its controller controls.
const ATTACK_TEXT =
  "Whenever War Machine attacks, attacking modified creatures you control gain double strike until end of turn.";

export default defineCard({
  name: "War Machine, Avenging Arsenal",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT} (Equipment, Auras you control, and counters are modifications.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", attacking: true, modified: true },
        keyword: "double-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
