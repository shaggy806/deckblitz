import { defineCard } from "../define.js";

// EDHREC rank 15456.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, put four +1/+1 counters on The Thing.";
const ATTACK_TEXT =
  "Whenever The Thing attacks, you may pay {R}{G}{W}{U}. When you do, double the number of each kind of counter on any number of target permanents you control.";

export default defineCard({
  name: "The Thing",
  manaCost: "{5}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${COMBAT_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      // Mister Fantastic's intervening-if.
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 4 },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      // "When you do" is a reflexive ability (rule 603.12): its targets are
      // chosen once the cost is paid. Deepglow Skate's doubling, over
      // permanents you control.
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {R}{G}{W}{U} to double the counters on any number of permanents you control?",
        cost: "{R}{G}{W}{U}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: {} } }],
          effect: { kind: "for-each-target", from: 0, effect: { kind: "double-counters", target: 0 } },
          text: "Double the number of each kind of counter on any number of target permanents you control.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
