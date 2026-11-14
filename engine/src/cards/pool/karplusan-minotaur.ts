import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 9494.
//
// Its cumulative upkeep is a coin flipped per age counter (rule 702.24a),
// each flip won or lost (705.2), and each one triggers one of its other two
// abilities. A lost flip's target is chosen by an opponent — named by its
// controller as the ability goes on the stack, asked only among two or more
// (`targetsChosenBy: "an-opponent"`) — though the ability stays its
// controller's (rule 603.3d).

const upkeep = cumulativeUpkeep({ doing: { kind: "flip-coin" }, text: "Flip a coin" });
const WON = "Whenever you win a coin flip, this creature deals 1 damage to any target.";
const LOST = "Whenever you lose a coin flip, this creature deals 1 damage to any target of an opponent's choice.";

export default defineCard({
  name: "Karplusan Minotaur",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${upkeep.text}\n${WON}\n${LOST}`,
  triggered: [
    upkeep,
    {
      trigger: { on: "event", event: "wins-coin-flip", who: "you" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: WON,
    },
    {
      trigger: { on: "event", event: "loses-coin-flip", who: "you" },
      targetsChosenBy: "an-opponent",
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: LOST,
    },
  ],
});
