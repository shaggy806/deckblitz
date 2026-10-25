import { defineCard } from "../define.js";

// Ferocious is checked once, as the spell resolves (its ruling). "Doesn't
// untap during its controller's next untap step" follows the creature, not
// the player (`doesntUntapNext` — whoever controls it then), as the ruling
// says.
export default defineCard({
  name: "Icy Blast",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Tap X target creatures.\nFerocious — If you control a creature with power 4 or greater, those creatures don't untap during their controllers' next untap steps.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: {
    kind: "conditional",
    condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
    then: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0, doesntUntapNext: true } },
    else: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
  },
});
