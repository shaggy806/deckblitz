import { defineCard } from "../define.js";

// EDHREC rank 13905. The Plains are counted as it resolves; "Plains" is the
// land type, so a nonbasic Plains counts too.
export default defineCard({
  name: "Gather the White Lotus",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create a 1/1 white Ally creature token for each Plains you control. Scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "create-token",
        token: "Ally Token",
        count: { countOf: { subtype: "Plains", controlledBy: "you" } },
      },
      { kind: "scry", amount: 2 },
    ],
  },
});
