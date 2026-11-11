import { defineCard } from "../define.js";

// Illithid Harvester's Adventure. "Doesn't untap during its controller's next
// untap step" follows the creature (`doesntUntapNext`): whoever controls it
// then.

export default defineCard({
  name: "Plant Tadpoles",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Tap X target creatures. They don't untap during their controllers' next untap steps.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0, doesntUntapNext: true } },
  faces: ["Illithid Harvester", "Plant Tadpoles"],
  adventure: true,
});
