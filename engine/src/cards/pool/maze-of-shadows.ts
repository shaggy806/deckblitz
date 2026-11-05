import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add {C}.";
const MAZE_TEXT =
  "{T}: Untap target attacking creature with shadow. Prevent all combat damage that would be dealt to and dealt by that creature this turn.";

export default defineCard({
  name: "Maze of Shadows",
  colors: [],
  types: ["land"],
  text: `${MANA_TEXT}\n${MAZE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, keyword: "shadow" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "damage-rule", to: { target: 0 }, combat: true },
          { kind: "damage-rule", by: { target: 0 }, combat: true },
        ],
      },
      resolve: null,
      text: MAZE_TEXT,
    },
  ],
});
