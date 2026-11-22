import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 19167.
//
// Balance on a creature, read the same way as Balance's own file: each part
// reads "the player who controls the fewest" as it begins (rule 608.2h), so
// the creature count is read after the lands are sacrificed and the cards
// discarded. The Magus is sacrificed as a cost, so it isn't counted.
const ABILITY_TEXT =
  "{4}{W}, {T}, Sacrifice this creature: Each player chooses a number of lands they control equal to the number of lands controlled by the player who controls the fewest, then sacrifices the rest. Players discard cards and sacrifice creatures the same way.";

const fewest = (filter: { readonly type: "land" | "creature" }) =>
  ({ amongPlayers: "least", of: { countOf: { ...filter, controlledBy: "you" }, forEachPlayer: true } }) as const;

export default defineCard({
  name: "Magus of the Balance",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: "{4}{W}", tap: true, sacrifice: "self" },
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
          {
            kind: "sacrifice-all-but",
            who: "each-player",
            keep: fewest({ type: "creature" }),
            filter: { type: "creature" },
          },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
