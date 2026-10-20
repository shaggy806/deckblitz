import { defineCard } from "../define.js";

// The Wolf-or-Werewolf check is an intervening if (rule 603.4), asked as the
// trigger fires and again as it resolves; one counter however many there are
// (the ruling).
const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you control another Wolf or Werewolf, put a +1/+1 counter on this creature.";
const DIES_TEXT = "When this creature dies, you gain life equal to its power.";

export default defineCard({
  name: "Packsong Pup",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 1,
  toughness: 1,
  text: `${COMBAT_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: {
        kind: "controls",
        filter: { subtypes: ["Wolf", "Werewolf"] },
        atLeast: 1,
        excludeSelf: true,
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { powerOf: "source" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
