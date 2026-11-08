import { defineCard } from "../define.js";

/** The permanent's owner does everything after the shuffle: they exile from
 * their own library, a land enters under their control, and they may cast
 * anything else free. */
export default defineCard({
  name: "Audacious Swap",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  casualty: 2,
  text: "Casualty 2 (As you cast this spell, you may sacrifice a creature with power 2 or greater. When you do, copy this spell and you may choose a new target for the copy.)\nThe owner of target nonenchantment permanent shuffles it into their library, then exiles the top card of their library. If it's a land card, they put it onto the battlefield. Otherwise, they may cast it without paying its mana cost.",
  targets: [{ kind: "permanent", filter: { notTypes: ["enchantment"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-into-library", target: 0 },
      {
        kind: "for-each-player",
        who: { ownerOf: 0 },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile-from-library", whose: "that-player", amount: 1 },
            { kind: "put-exiled-this-way-onto-battlefield", filter: { type: "land" } },
            { kind: "cast-now", from: "exiled-this-way", by: "that-player", free: true },
          ],
        },
      },
    ],
  },
});
