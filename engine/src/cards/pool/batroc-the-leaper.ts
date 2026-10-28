import { defineCard } from "../define.js";

const COUNTERS_TEXT = "Batroc enters with a +1/+1 counter on him for each time he was kicked.";
const ENTER_TEXT =
  "When Batroc enters, he deals damage equal to his power to each of up to X targets, where X is the number of times he was kicked.";

export default defineCard({
  name: "Batroc the Leaper",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 2,
  text: `Multikicker {2} (You may pay an additional {2} any number of times as you cast this spell.)\n${COUNTERS_TEXT}\n${ENTER_TEXT}`,
  kicker: { cost: "{2}", multi: true },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "times-kicked" } },
      text: COUNTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "any-target", max: { timesKicked: "source" } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
