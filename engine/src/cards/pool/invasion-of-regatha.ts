import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 15377.
//
// "Another target battle or opponent" is one slot: a battle other than this
// Siege, or a player other than its controller (`orPlayer: "opponent"`). The
// creature is a second "target", so a battle that's also a creature may be
// both (rule 115.3). Both are dealt damage at once, by the Siege as it last
// existed if it has left (608.2h).
const ENTER_TEXT =
  "When this Siege enters, it deals 4 damage to another target battle or opponent and 1 damage to up to one target creature.";

export default defineCard({
  name: "Invasion of Regatha",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 5,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "other", of: { kind: "permanent", filter: { type: "battle" }, orPlayer: "opponent" } },
        { kind: "optional", of: "creature" },
      ],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 4, target: 0 },
          { kind: "damage", amount: 1, target: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of Regatha", "Disciples of the Inferno"],
  transform: true,
});
