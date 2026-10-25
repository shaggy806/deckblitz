import { defineCard } from "../define.js";

// EDHREC rank 28922. A Cyclops gets the -1/-1 first, then is destroyed (its ruling).

export default defineCard({
  name: "Eye Gouge",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -1/-1 until end of turn. If it's a Cyclops, destroy it.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      { kind: "conditional", condition: { kind: "target", index: 0, filter: { subtype: "Cyclops" } }, then: { kind: "destroy", target: 0 } },
    ],
  },
});
