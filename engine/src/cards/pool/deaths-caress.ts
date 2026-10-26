import { defineCard } from "../define.js";

// EDHREC rank 28866. Whether it's a Human is read before the destroy —
// destroying changes no types, so it's the same answer as "as it last
// existed" (its ruling), and an indestructible or regenerated Human still
// gains the life. The toughness is read after, from the last known
// information when it died (Garruk, Apex Predator's −3).

export default defineCard({
  name: "Death's Caress",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. If that creature was a Human, you gain life equal to its toughness.",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { subtype: "Human" } },
    then: {
      kind: "sequence",
      effects: [
        { kind: "destroy", target: 0 },
        { kind: "gain-life", amount: { toughnessOf: 0 } },
      ],
    },
    else: { kind: "destroy", target: 0 },
  },
});
