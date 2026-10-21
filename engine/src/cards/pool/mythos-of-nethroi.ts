import { defineCard } from "../define.js";

// Any nonland permanent may be targeted; whether it's destroyed is decided as
// the spell resolves (the ruling).
export default defineCard({
  name: "Mythos of Nethroi",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonland permanent if it's a creature or if {G}{W} was spent to cast this spell.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "conditional",
    condition: {
      kind: "any",
      of: [
        { kind: "target", index: 0, filter: { type: "creature" } },
        { kind: "source", filter: { manaSpentOfColors: { G: 1, W: 1 } } },
      ],
    },
    then: { kind: "destroy", target: 0 },
  },
});
