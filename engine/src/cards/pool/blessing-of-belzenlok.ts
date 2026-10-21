import { defineCard } from "../define.js";

// EDHREC rank 18592. Gimli's Fury's shape: the "target" condition reads the
// creature as the spell resolves.

export default defineCard({
  name: "Blessing of Belzenlok",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +2/+1 until end of turn. If it's legendary, it also gains lifelink until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 1, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { supertype: "legendary" } },
        then: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      },
    ],
  },
});
