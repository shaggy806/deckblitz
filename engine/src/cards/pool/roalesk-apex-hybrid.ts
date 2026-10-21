import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 11036.
//
// Proliferate twice in one resolution (its ruling): two `proliferate` steps,
// each its own choice, the second seeing the first's counters.

const ENTER_TEXT = "When Roalesk enters, put two +1/+1 counters on another target creature you control.";
const DIES_TEXT =
  "When Roalesk dies, proliferate, then proliferate again. (Choose any number of permanents and/or players, then give each another counter of each kind already there. Then do it again.)";

export default defineCard({
  name: "Roalesk, Apex Hybrid",
  manaCost: "{2}{G}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mutant"],
  power: 4,
  toughness: 5,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "proliferate" }, { kind: "proliferate" }] },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
