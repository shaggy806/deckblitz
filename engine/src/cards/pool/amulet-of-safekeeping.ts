import { defineCard } from "../define.js";

// Core Set 2019.
//
// - You becoming a target: a `becomes-target` trigger for its controller as a player alone
//   (`player: "you"`, `playerOnly`), only an opponent's spell or ability (`byOpponentOnly`); "counter
//   that spell or ability unless its controller pays {1}" is ward's counter (`targetedBy`).
// - "Creature tokens get -1/-0": every player's, Illness in the Ranks's shape.

const TRIGGER_TEXT =
  "Whenever you become the target of a spell or ability an opponent controls, counter that spell or ability unless its controller pays {1}.";
const TOKEN_TEXT = "Creature tokens get -1/-0.";

export default defineCard({
  name: "Amulet of Safekeeping",
  manaCost: "{2}",
  types: ["artifact"],
  text: `${TRIGGER_TEXT}\n${TOKEN_TEXT}`,
  static: [
    { affects: { scope: "filter", filter: { type: "creature", token: true } }, grantPt: [-1, 0], text: TOKEN_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", player: "you", playerOnly: true, byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
