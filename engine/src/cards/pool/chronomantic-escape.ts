import { defineCard } from "../define.js";

// Inspiring Refrain's shape: the spell exiles itself with three time counters
// as it resolves (`give-suspend` on "source"), and it has suspend printed, so
// it's suspended again. "Creatures can't attack you" names you alone, and
// reaches creatures that come later: a rule, not a mark on those there now.
export default defineCard({
  name: "Chronomantic Escape",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{2}{W}" },
  text: "Until your next turn, creatures can't attack you. Exile Chronomantic Escape with three time counters on it.\nSuspend 3—{2}{W} (Rather than cast this card from your hand, you may pay {2}{W} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", filter: { type: "creature" }, restrictions: [{ kind: "cant-attack", at: "you" }], duration: "until-your-next-turn" },
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});
