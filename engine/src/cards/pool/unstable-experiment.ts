import { defineCard } from "../define.js";

// EDHREC rank 7899.
//
// Rulings:
//   [2025-09-19] Once an ability that causes a creature to connive begins to resolve, no player
//     may take any other actions until it's done. Notably, opponents can't try to remove the
//     conniving creature after you discard a nonland card but before it receives a counter.
//   [2025-09-19] If no card is discarded, most likely because that player's hand is empty and an
//     effect says they can't draw cards, the conniving creature does not receive a +1/+1 counter.
//   [2025-09-19] If a resolving spell or ability instructs a specific creature to connive but that
//     creature has left the battlefield, the creature still connives. If you discard a nonland
//     card this way, you won't put a +1/+1 counter on anything. Abilities that trigger "when [that
//     creature] connives" will trigger.

// Sublime Epiphany's "target player draws a card", then `connive` on an
// optional second slot: declining it, nothing connives.
const TEXT =
  "Target player draws a card, then up to one target creature you control connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)";

export default defineCard({
  name: "Unstable Experiment",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["player", { kind: "optional", of: "creature-you-control" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1, target: 0 },
      { kind: "connive", target: 1 },
    ],
  },
});
