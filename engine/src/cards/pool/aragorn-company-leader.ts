import { defineCard } from "../define.js";

// EDHREC rank 11471.
//
// Rulings:
//   If the creature you choose as your Ring-bearer was already your
//   Ring-bearer, that still counts as choosing that creature as your
//   Ring-bearer.
//
// The counter is chosen as the first ability resolves (a `modal` in the
// effect, not a modal ability). The second reads the placement that fired it
// (`"trigger-placement"`): every kind put on Aragorn at once, one of each.
const TEMPT_TEXT =
  "Whenever the Ring tempts you, if you chose a creature other than Aragorn as your Ring-bearer, " +
  "put your choice of a counter from among first strike, vigilance, deathtouch, and lifelink on Aragorn.";
const COUNTERS_TEXT =
  "Whenever you put one or more counters on Aragorn, put one of each of those kinds of counters on up to one other target creature.";

const counterOnSelf = (counter: string, text: string) =>
  ({ text, effect: { kind: "add-counter", target: "source", counter, amount: 1 } }) as const;

export default defineCard({
  name: "Aragorn, Company Leader",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Ranger"],
  power: 3,
  toughness: 3,
  text: `${TEMPT_TEXT}\n${COUNTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "ring-tempts", who: "you", chosen: "other" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          counterOnSelf("first-strike", "A first strike counter"),
          counterOnSelf("vigilance", "A vigilance counter"),
          counterOnSelf("deathtouch", "A deathtouch counter"),
          counterOnSelf("lifelink", "A lifelink counter"),
        ],
      },
      resolve: null,
      text: TEMPT_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "self", byYou: true },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "put-counters-of", of: "trigger-placement", target: 0, oneOfEach: true },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
