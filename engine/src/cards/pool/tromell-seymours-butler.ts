import { defineCard } from "../define.js";

// EDHREC rank 3970.
//
// X is counted once, as the ability resolves: the nontoken creatures you
// control now that entered this turn, however they came to you (the ruling).
// Each proliferate is its own choice of what gets counters.

const COUNTER_TEXT = "Each other nontoken creature you control enters with an additional +1/+1 counter on it.";
const PROLIFERATE_TEXT =
  "{1}, {T}: Proliferate X times, where X is the number of nontoken creatures you control that entered this turn. (To proliferate, choose any number of permanents and/or players, then give each another counter of each kind already there.)";

export default defineCard({
  name: "Tromell, Seymour's Butler",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Advisor"],
  power: 2,
  toughness: 3,
  text: `${COUNTER_TEXT}\n${PROLIFERATE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", token: false, controlledBy: "you" },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: COUNTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "repeat",
        times: { countOf: { type: "creature", token: false, controlledBy: "you", enteredThisTurn: true } },
        effect: { kind: "proliferate" },
      },
      resolve: null,
      text: PROLIFERATE_TEXT,
    },
  ],
});
