import { cumulativeUpkeep } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 12790.
//
// Cumulative upkeep paid by exiling the top card of your library once per age
// counter (rule 702.24a): all of it or none, so not with fewer cards than age
// counters (118.3). Unpaid, Thought Lash is sacrificed as usual, then its
// trigger exiles the library (the ruling) — "that player" is the one who
// didn't pay (the event's player, `"trigger-player"`). The last ability
// can't be activated with an empty library (the ruling: its cost can't be
// paid).

const UNPAID = "When a player doesn't pay this enchantment's cumulative upkeep, that player exiles all cards from their library.";
const PREVENT = "Exile the top card of your library: Prevent the next 1 damage that would be dealt to you this turn.";

export default defineCard({
  name: "Thought Lash",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `Cumulative upkeep—Exile the top card of your library. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\n${UNPAID}\n${PREVENT}`,
  triggered: [
    cumulativeUpkeep({ doing: { kind: "exile-from-library", amount: 1 }, text: "Exile the top card of your library" }),
    {
      trigger: { on: "event", event: "cumulative-upkeep-unpaid", who: "self" },
      targets: [],
      effect: { kind: "exile-from-library", whose: "trigger-player", allBut: 0 },
      resolve: null,
      text: UNPAID,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, do: { kind: "exile-from-library", amount: 1 } },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, amount: 1 },
      resolve: null,
      text: PREVENT,
    },
  ],
});
