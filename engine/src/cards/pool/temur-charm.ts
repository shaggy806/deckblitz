import { defineCard } from "../define.js";

// EDHREC rank 7491.
//
// The first mode needs both targets to be cast; the pump happens if the
// creature you control is still legal, the fight only if both are (the
// rulings — `fight` does nothing once either slot is illegal). The third mode
// is a rule for the rest of the turn, matched as blockers are declared: a
// creature that enters later, or whose power drops to 3 by then, can't block
// either (the ruling).
const FIGHT_TEXT =
  "Target creature you control gets +1/+1 until end of turn. It fights target creature you don't control.";
const COUNTER_TEXT = "Counter target spell unless its controller pays {3}.";
const BLOCK_TEXT = "Creatures with power 3 or less can't block this turn.";

export default defineCard({
  name: "Temur Charm",
  manaCost: "{G}{U}{R}",
  colors: ["U", "R", "G"],
  types: ["instant"],
  text: `Choose one —\n• ${FIGHT_TEXT}\n• ${COUNTER_TEXT}\n• ${BLOCK_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: FIGHT_TEXT,
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
            { kind: "fight", a: 0, b: 1 },
          ],
        },
      },
      {
        text: COUNTER_TEXT,
        targets: ["spell"],
        effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      },
      {
        text: BLOCK_TEXT,
        targets: [],
        effect: {
          kind: "restrict",
          filter: { type: "creature", power: { op: "lte", n: 3 } },
          restrictions: ["cant-block"],
        },
      },
    ],
  },
});
