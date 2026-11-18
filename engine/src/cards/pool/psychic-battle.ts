import { defineCard } from "../define.js";

// EDHREC rank 16166.
//
// "A player chooses one or more targets": a spell cast, an ability activated
// or put on the stack with at least one target chosen, or the targets of a
// spell or ability (or a copy's) changed — once for that spell or ability,
// the trigger object (the `"chooses-targets"` event). The single greatest mana
// value among the cards revealed wins; a player with an empty library reveals
// nothing to compare, and a tie changes nothing (the rulings). The winner may
// change all, some or none of the targets, each new one legal, never the
// number of them (rule 115.7d, the rulings) — the targets chosen as its
// controller would choose them. Its own changes don't trigger a Psychic
// Battle (`unseenByNamesake`); they're still "becomes the target" for
// anything else (ward).

const TEXT =
  "Whenever a player chooses one or more targets, each player reveals the top card of their library. The player who reveals the card with the greatest mana value may change the target or targets. If two or more cards are tied for greatest, the target or targets remain unchanged. Changing targets this way doesn't trigger abilities of permanents named Psychic Battle.";

export default defineCard({
  name: "Psychic Battle",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "chooses-targets" },
      targets: [],
      effect: {
        kind: "exile-top-contest",
        reveal: true,
        then: {
          kind: "as-player",
          who: "that-player",
          effect: { kind: "change-targets", target: "trigger-object", how: "choose-new", unseenByNamesake: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
