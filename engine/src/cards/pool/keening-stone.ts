import { defineCard } from "../define.js";

const TEXT = "{5}, {T}: Target player mills X cards, where X is the number of cards in that player's graveyard.";

// X is read off the target player's graveyard as the ability resolves (the
// ruling) — Eldritch Pact's `for-each-target` over the one player slot, so
// `graveyardSize: "each"` names that player.
export default defineCard({
  name: "Keening Stone",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{5}", tap: true },
      targets: ["player"],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "mill", target: 0, amount: { graveyardSize: "each" } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
