import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const TEXT =
  "Create a 2/2 white and blue Detective creature token. If a creature died this turn, you gain 2 life, surveil 2, then investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Drag the Canal",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Detective Token", count: 1 },
      {
        kind: "conditional",
        condition: { kind: "creature-died-this-turn" },
        then: {
          kind: "sequence",
          effects: [{ kind: "gain-life", amount: 2 }, { kind: "surveil", amount: 2 }, investigate()],
        },
      },
    ],
  },
});
