import { defineCard } from "../define.js";

// Each part reads "the player who controls the fewest" as it begins (rule
// 608.2h), so the creature count is read after the lands are sacrificed and
// the cards discarded. Each player chooses what to keep, in turn from the
// active player, knowing the choices before theirs (rule 101.4); for cards,
// keeping that many is discarding the rest.
const fewest = (filter: { readonly type: "land" | "creature" }) =>
  ({ amongPlayers: "least", of: { countOf: { ...filter, controlledBy: "you" }, forEachPlayer: true } }) as const;

export default defineCard({
  name: "Balance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text:
    "Each player chooses a number of lands they control equal to the number of lands controlled by the player who controls the fewest, then sacrifices the rest. Players discard cards and sacrifice creatures the same way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-all-but", who: "each-player", keep: fewest({ type: "land" }), filter: { type: "land" } },
      {
        kind: "discard",
        target: "each-player",
        amount: {
          difference: [{ cardsInHand: "each" }, { amongPlayers: "least", of: { cardsInHand: "each" } }],
        },
      },
      { kind: "sacrifice-all-but", who: "each-player", keep: fewest({ type: "creature" }), filter: { type: "creature" } },
    ],
  },
});
