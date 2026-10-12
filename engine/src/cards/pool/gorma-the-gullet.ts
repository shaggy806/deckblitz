import { defineCard } from "../define.js";

// EDHREC rank 7376.
//
// "Died under your control this turn" counts each creature by the controller
// it had as it died. The enters replacement never reaches Gorma itself or a
// creature entering alongside it (the ruling).
const DIES_TEXT = "Whenever another creature you control dies, put a +1/+1 counter on Gorma.";
const ENTERS_TEXT =
  "Nontoken creatures you control enter with an additional +1/+1 counter on them for each creature that died " +
  "under your control this turn.";

export default defineCard({
  name: "Gorma, the Gullet",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Pest", "Frog"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${DIES_TEXT}\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you", token: false },
        counters: { kind: "+1/+1", amount: { creaturesDiedThisTurn: true } },
      },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
