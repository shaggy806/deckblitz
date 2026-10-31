import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of your end step, if one or more creatures died this turn, you gain that much life and distribute that many +1/+1 counters among any number of creatures you control.";

// "That much" / "that many" is the number of creatures that died this turn;
// the counters are distributed as it resolves, untargeted (rule 608.2d — its
// ruling).
export default defineCard({
  name: "Feast of the Victorious Dead",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["enchantment"],
  text: END_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: { creaturesDiedThisTurn: true, anyController: true } },
          {
            kind: "counters-distributed",
            counter: "+1/+1",
            total: { creaturesDiedThisTurn: true, anyController: true },
            filter: { type: "creature", controlledBy: "you" },
            among: "creatures you control",
          },
        ],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
