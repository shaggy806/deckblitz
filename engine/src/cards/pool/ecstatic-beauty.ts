import { defineCard } from "../define.js";

// The cards exiled this way that have suspend printed get four time counters
// — suspended, so cast at their owner's upkeep when the last comes off, if
// not played this turn. None of the others gains suspend.
export default defineCard({
  name: "Ecstatic Beauty",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  suspend: { n: 4, cost: "{R}" },
  text: "Exile the top three cards of your library. You may play those cards until end of turn. Put four time counters on each of those cards that has suspend.\nSuspend 4—{R} (Rather than cast this card from your hand, you may pay {R} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "impulse-exile", amount: 3, duration: "end-of-turn" },
      { kind: "give-suspend", timeCounters: 4, onlyWithSuspend: true },
    ],
  },
});
