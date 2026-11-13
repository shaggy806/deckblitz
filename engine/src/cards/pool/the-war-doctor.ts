import { defineCard } from "../define.js";

// Two trigger conditions of one ability, each "one or more": once per
// phasing event, once per simultaneous exile (rule 603.2c). A phase-out
// looks back in time (rule 603.10b), so The War Doctor phasing out with
// others still sees them go.
const TIME_TEXT =
  "Whenever one or more other permanents phase out and whenever one or more other cards are put into exile from anywhere, put a time counter on The War Doctor.";
const ATTACK_TEXT =
  "Whenever The War Doctor attacks, it deals damage equal to the number of time counters on it to any target. If a creature dealt damage this way would die this turn, exile it instead.";

const addTime = { kind: "add-counter", target: "source", counter: "time", amount: 1 } as const;

export default defineCard({
  name: "The War Doctor",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Time Lord", "Doctor"],
  power: 3,
  toughness: 5,
  text: `${TIME_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "phases-out", batched: true, filter: { isSource: false } },
      targets: [],
      effect: addTime,
      resolve: null,
      text: TIME_TEXT,
    },
    {
      trigger: { on: "put-into-exile", who: "any", filter: { isSource: false } },
      sameAbilityAs: 0,
      targets: [],
      effect: addTime,
      resolve: null,
      text: TIME_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: { countersOn: "source", counter: "time" }, target: 0 },
          { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "creature" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
