import { defineCard } from "../define.js";

// The mana stays: the land goes back only as the trigger resolves, and only if
// it's still that permanent (rule 400.7).
const LANDS = "Each player may play an additional land during each of their turns.";
const RETURN = "Whenever a land is tapped for mana, return it to its owner's hand.";

export default defineCard({
  name: "Storm Cauldron",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${LANDS}\n${RETURN}`,
  static: [
    {
      affects: { scope: "self" },
      extraLandsPerTurn: 1,
      extraLandsForEachPlayer: true,
      text: LANDS,
    },
  ],
  triggered: [
    {
      trigger: { on: "tapped-for-mana", who: "any", filter: { type: "land" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "trigger-object" },
      resolve: null,
      text: RETURN,
    },
  ],
});
