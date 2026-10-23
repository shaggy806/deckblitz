import { defineCard } from "../define.js";

// EDHREC rank 7856.
// The +2/+2 reaches only the creatures you control as it resolves; the
// second sentence is a delayed triggered ability for the rest of the turn
// (rule 603.7c): each creature that blocks gives its controller a poison
// counter.
const PUMP_TEXT = "Creatures you control get +2/+2 until end of turn.";
const BLOCK_TEXT = "Whenever a creature blocks this turn, its controller gets a poison counter.";

export default defineCard({
  name: "Noxious Assault",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `${PUMP_TEXT} ${BLOCK_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "blocks", who: "any", filter: { type: "creature" } } },
        effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-controller" },
        text: BLOCK_TEXT,
      },
    ],
  },
});
