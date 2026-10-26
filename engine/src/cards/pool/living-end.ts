import { defineCard } from "../define.js";

const TEXT =
  "Each player exiles all creature cards from their graveyard, then sacrifices all creatures they control, then puts all cards they exiled this way onto the battlefield.";

// No mana cost: cast only through suspend (or another free / alternative cast).
export default defineCard({
  name: "Living End",
  colors: ["B"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{2}{B}{B}" },
  text: `Suspend 3—{2}{B}{B} (Rather than cast this card from your hand, pay {2}{B}{B} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)\n${TEXT}`,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: "each-player", filter: { type: "creature" } },
      { kind: "sacrifice-all", who: "each-player", filter: { type: "creature" } },
      { kind: "put-exiled-this-way-onto-battlefield" },
    ],
  },
});
