import { defineCard } from "../define.js";

// Hour of Devastation (HOU). EDHREC rank 2924. Each end step, the enchanted
// player — the trigger player of a Curse's trigger whose event names nobody —
// mills X, X read as the trigger resolves (the ruling: three Fraying Sanity
// on one player with four cards put there mill four, eight, then sixteen).
// It counts the cards put into their graveyard from anywhere this turn,
// though Fraying Sanity wasn't there yet and they've left since (the
// ruling): the turn history's `to-graveyard` list, less tokens, which
// aren't cards.

const TEXT =
  "At the beginning of each end step, enchanted player mills X cards, where X is the number of cards put into their graveyard from anywhere this turn.";

export default defineCard({
  name: "Fraying Sanity",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "mill",
        target: "trigger-player",
        amount: { turnHistory: "to-graveyard", who: "trigger-player", filter: { token: false } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
