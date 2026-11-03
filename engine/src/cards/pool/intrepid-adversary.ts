import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, you may pay {1}{W} any number of times. When you pay this cost one or more times, put that many valor counters on this creature.";
const ANTHEM_TEXT = "Creatures you control get +1/+1 for each valor counter on this creature.";

// The number of times is announced and paid as the enters ability resolves; a
// second, reflexive ability then triggers, and players can respond to it
// before the counters arrive (rule 603.12).
export default defineCard({
  name: "Intrepid Adversary",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${ETB_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{W} any number of times to put that many valor counters on this creature?",
        cost: "{1}{W}",
        costTimes: true,
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "add-counter", target: "source", counter: "valor", amount: "x" },
          text: "When you pay this cost one or more times, put that many valor counters on this creature.",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPtPerCount: { countersOnSource: "valor", pt: [1, 1] },
      text: ANTHEM_TEXT,
    },
  ],
});
