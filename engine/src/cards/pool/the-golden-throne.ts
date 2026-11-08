import { defineCard } from "../define.js";

const LIFE = "Arcane Life-support — If you would lose the game, instead exile The Golden Throne and your life total becomes 1.";
const MANA = "A Thousand Souls Die Every Day — {T}, Sacrifice a creature: Add three mana in any combination of colors.";

export default defineCard({
  name: "The Golden Throne",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  supertypes: ["legendary"],
  text: `${LIFE}\n${MANA}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-lose-game",
        who: "you",
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "exile", target: "source" },
              { kind: "set-life-total", who: "you", amount: 1 },
            ],
          },
        },
      },
      text: LIFE,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 3 },
      resolve: null,
      text: MANA,
    },
  ],
});
