import { defineCard } from "../define.js";

// The second sentence is a delayed triggered ability lasting the turn (rule
// 603.7c): each creature that blocks — anyone's — is its trigger object.
const UNTAP_TEXT = "Untap all white creatures you control.";
const BLOCK_TEXT = "Whenever a creature blocks this turn, it gets +0/+1 until end of turn.";

export default defineCard({
  name: "Battle Cry",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${UNTAP_TEXT}\n${BLOCK_TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap-all", filter: { type: "creature", colors: ["W"], controlledBy: "you" } },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "blocks", who: "any", filter: { type: "creature" } } },
        effect: { kind: "modify-pt", target: "trigger-object", power: 0, toughness: 1, duration: "end-of-turn" },
        text: BLOCK_TEXT,
      },
    ],
  },
});
