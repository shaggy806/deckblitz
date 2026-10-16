import { defineCard } from "../define.js";

export default defineCard({
  name: "Brackish Blunder",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. If it was tapped, create a Map token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      // "If it was tapped": the creature as it last existed on the
      // battlefield (rule 608.2h).
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { tapped: true } },
        then: { kind: "create-token", token: "Map Token", count: 1 },
      },
    ],
  },
});
