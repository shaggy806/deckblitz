import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 26283.
//
// Filigree Fracture's shape: "was blue or black" reads the target as it last
// existed once destroyed.
export default defineCard({
  name: "Gloomwidow's Feast",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target creature with flying. If that creature was blue or black, create a 1/2 green Spider creature token with reach. (It can block creatures with flying.)",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] } },
        then: { kind: "create-token", token: "1/2 Green Spider Token (Reach)", count: 1 },
      },
    ],
  },
});
