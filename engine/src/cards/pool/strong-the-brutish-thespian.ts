import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// "Life lost from radiation" is life lost as a result of the triggered
// ability rad counters bring (rule 728.1a). The last ability replaces that
// loss with a gain of the same amount (rule 614.1a): the loss never happens
// (614.6), and the rad counters are still removed.
const ENRAGE_TEXT =
  "Enrage — Whenever Strong is dealt damage, you get three rad counters and put three +1/+1 counters on Strong.";
const RADIATION_TEXT = "You gain life rather than lose life from radiation.";

export default defineCard({
  name: "Strong, the Brutish Thespian",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Berserker"],
  power: 7,
  toughness: 7,
  text: `Ward {2}\n${ENRAGE_TEXT}\n${RADIATION_TEXT}`,
  triggered: [
    ward({ mana: "{2}" }),
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-player-counters", counter: "rad", amount: 3 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
        ],
      },
      resolve: null,
      text: ENRAGE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-lose-life",
        who: "you",
        from: "radiation",
        instead: { effect: { kind: "gain-life", amount: "x" } },
      },
      text: RADIATION_TEXT,
    },
  ],
});
