import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 14464. Marvel Super Heroes Commander.
//
// "You may pay {1}. When you do, …" is a reflexive trigger (rule 603.12,
// Go-Shintai of Ancient Wars' shape): the target is chosen once {1} is paid.
// The ward is Cathedral Acolyte's: a granted triggered ability, and a bare
// "with a counter on it" counts every kind.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, you may pay {1}. When you do, put a +1/+1 counter on target creature you control.";
const WARD_TEXT = "Each creature you control with a counter on it has ward {1}.";

export default defineCard({
  name: "Matt Murdock, Justice Seeker",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Advisor", "Hero"],
  power: 2,
  toughness: 2,
  text: `${COMBAT_TEXT}\n${WARD_TEXT} (Whenever it becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to put a +1/+1 counter on target creature you control?",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature-you-control"],
          effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          text: "When you do, put a +1/+1 counter on target creature you control.",
        },
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
      },
      grantsTriggered: [ward({ mana: "{1}" })],
      text: WARD_TEXT,
    },
  ],
});
