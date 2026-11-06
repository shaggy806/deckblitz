import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// EDHREC rank 31141.

const ENTER_TEXT =
  "When this enchantment enters, create a number of 2/1 red Klingon Warrior creature tokens with haste equal to " +
  "the number of opponents you have.";
const MELEE_TEXT =
  "Creatures you control have melee. (Whenever a creature with melee attacks, it gets +1/+1 until end of turn for " +
  "each opponent you attacked this combat.)";

export default defineCard({
  name: "Glory to the Empire!",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${MELEE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Klingon Warrior Token", count: { countPlayers: "each-opponent" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [{ affects: { scope: "creatures-you-control" }, grantsTriggered: [melee()], text: MELEE_TEXT }],
});
