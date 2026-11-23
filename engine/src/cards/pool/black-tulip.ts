import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). "Until you've begun your sixth turn of
// the game": activatable once you've taken six turns, the sixth under way
// included — on your sixth turn and on any turn after it, whoever's
// (`turns-taken` counts the turn under way). Exiling it is a cost, not a
// sacrifice. "Three mana of any one color" is `any-color` × 3 (Black Lotus).

const TEXT =
  "{T}, Exile Black Tulip: Add three mana of any one color. You can't activate this ability until you've begun your sixth turn of the game. (Keep track if this is in your deck!)";

export default defineCard({
  name: "Black Tulip",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, do: { kind: "exile", target: "source" } },
      condition: { kind: "not", of: { kind: "turns-taken", atMost: 5 } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
