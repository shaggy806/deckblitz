import { defineCard } from "../define.js";

// EDHREC rank 20836.

export default defineCard({
  name: "Lantern Flare",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Cleave {X}{R}{W} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nLantern Flare deals X damage to target creature or planeswalker and you gain X life. [X is the number of creatures you control.]",
  // Cast normally, X is the number of creatures you control, counted as it
  // resolves; cleaved, it's the X paid in {X}{R}{W}.
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
      { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
    ],
  },
  cleave: {
    cost: "{X}{R}{W}",
    targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage", target: 0, amount: "x" },
        { kind: "gain-life", amount: "x" },
      ],
    },
  },
});
