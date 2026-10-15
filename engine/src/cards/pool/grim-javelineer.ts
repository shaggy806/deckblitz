import { defineCard } from "../define.js";

// EDHREC rank 26808. Desperate Measures' death watch on the target, this turn
// only: a delayed trigger set up as the attack trigger resolves (rule 603.7),
// so a target gone by then sets up nothing.

const DIES_TEXT = "When that creature dies this turn, surveil 1.";
const ATTACK_TEXT = `Whenever you attack, target attacking creature gets +1/+0 until end of turn. ${DIES_TEXT}`;

export default defineCard({
  name: "Grim Javelineer",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  text: `${ATTACK_TEXT} (Look at the top card of your library. You may put that card into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: { leaves: 0, to: ["graveyard"], thisTurn: true },
            effect: { kind: "surveil", amount: 1 },
            text: DIES_TEXT,
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
