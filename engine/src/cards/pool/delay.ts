import { defineCard } from "../define.js";

// Rulings:
//   If the target spell was cast with flashback, Delay's effect will exile it, not the flashback
//     effect. The card will get time counters and gain suspend (if it didn't already have suspend).
//   If the target spell is face down, it'll be exiled face up.
export default defineCard({
  name: "Delay",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. If the spell is countered this way, exile it with three time counters on it instead of putting it into its owner's graveyard. If it doesn't have suspend, it gains suspend. (At the beginning of its owner's upkeep, they remove a time counter. When the last is removed, they may play it without paying its mana cost. If it's a creature, it has haste.)",
  targets: ["spell"],
  effect: { kind: "counter", target: 0, into: "exile", withTimeCounters: 3 },
});
