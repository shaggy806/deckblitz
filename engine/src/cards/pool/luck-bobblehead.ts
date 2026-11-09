import { defineCard } from "../define.js";

const ROLL_TEXT =
  "{1}, {T}: Roll X six-sided dice, where X is the number of Bobbleheads you control. Create a tapped Treasure token " +
  "for each even result. If you rolled 6 exactly seven times, you win the game.";

export default defineCard({
  name: "Luck Bobblehead",
  manaCost: "{3}",
  types: ["artifact"],
  subtypes: ["Bobblehead"],
  text: `{T}: Add one mana of any color.\n${ROLL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 6,
        count: { countOf: { subtype: "Bobblehead", controlledBy: "you" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Treasure Token", count: { roll: "even" }, tapped: true },
            {
              kind: "conditional",
              condition: { kind: "amounts", left: { roll: { equals: 6 } }, op: "eq", right: 7 },
              then: { kind: "win-game" },
            },
          ],
        },
      },
      resolve: null,
      text: ROLL_TEXT,
    },
  ],
});
