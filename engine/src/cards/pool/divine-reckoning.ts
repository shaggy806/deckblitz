import { defineCard } from "../define.js";

// Rulings:
//   Starting with the player whose turn it is, each player chooses a creature in turn order.
//   Players will know the choice of each player who chose before them.

export default defineCard({
  name: "Divine Reckoning",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Each player chooses a creature they control. Destroy the rest.\n" +
    "Flashback {5}{W}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  flashback: { cost: "{5}{W}{W}" },
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        for: { permanent: { type: "creature", controlledBy: "you" }, own: true, keep: true },
      },
      { kind: "destroy-all", filter: { type: "creature", notThisWay: "chosen" } },
    ],
  },
});
