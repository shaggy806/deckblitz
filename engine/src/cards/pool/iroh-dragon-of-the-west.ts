import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 6939.
//
// Rulings:
//   [2025-10-02] "Firebending N" is a keyword that represents the ability "Whenever this creature
//     attacks, add N {R}. Until end of combat, you don't lose this mana as steps end."
//   [2025-10-02] Multiple instances of firebending on the same creature trigger separately, each
//     granting you the appropriate amount of mana.
//   [2025-10-02] Any other mana you add during combat will still be lost as normal when moving
//     between steps of combat.
//   [2025-10-02] Mana from firebending abilities isn't lost until you leave combat and go to your
//     second main phase. It can be used at any time during combat, even after combat damage has
//     been dealt.
//   [2025-10-02] Firebending abilities aren't mana abilities. They use the stack and can be
//     responded to.

// Mentor is Legion Warboss's triggered ability. "Each creature you control
// with a counter on it" — any kind — is the set as the trigger resolves (rule
// 611.2c): one that gets a counter later that turn doesn't gain firebending.
const MENTOR_TEXT =
  "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)";

export default defineCard({
  name: "Iroh, Dragon of the West",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Ally"],
  power: 4,
  toughness: 4,
  keywords: ["haste"],
  text: "Haste\nMentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\nAt the beginning of combat on your turn, each creature you control with a counter on it gains firebending 2 until end of turn. (Whenever it attacks, add {R}{R}. This mana lasts until end of combat.)",
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
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "grant-triggered-all",
        filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
        ability: firebending(2),
        duration: "end-of-turn",
      },
      resolve: null,
      text: "At the beginning of combat on your turn, each creature you control with a counter on it gains firebending 2 until end of turn.",
    },
  ],
});
