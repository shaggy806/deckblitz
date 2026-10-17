import { defineCard } from "../define.js";

const REMOVE_TEXT = "{4}, {T}: Remove target attacking or blocking creature from combat.";

export default defineCard({
  name: "Labyrinth of Skophos",
  colors: [],
  types: ["land"],
  text: `{T}: Add {C}.\n${REMOVE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{4}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", anyOf: [{ attacking: true }, { blocking: true }] } }],
      effect: { kind: "remove-from-combat", target: 0 },
      resolve: null,
      text: REMOVE_TEXT,
    },
  ],
});
