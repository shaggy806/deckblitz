import { defineCard } from "../define.js";

// Rulings:
//   After you choose a nonland permanent, each other player does so in turn order starting from
//   the player whose turn it is. Each player will know the choice made by previous players.
//   A permanent with indestructible can be chosen this way even though it wouldn't be destroyed
//   otherwise.
//   Lands can't be chosen and won't be destroyed, even if they have other types (such as an
//   artifact land).

export default defineCard({
  name: "Fortunate Few",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Choose a nonland permanent you don't control, then each other player chooses a nonland permanent they don't control that hasn't been chosen this way. Destroy all other nonland permanents.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        startingWith: "you-then-active-player",
        for: {
          permanent: { notTypes: ["land"], controlledBy: "opponent", notThisWay: "chosen" },
          own: true,
          keep: true,
        },
      },
      { kind: "destroy-all", filter: { notTypes: ["land"], notThisWay: "chosen" } },
    ],
  },
});
