import { defineCard } from "../define.js";

// EDHREC rank 24298. Ixalan. Whether it's a Vampire is read as the spell
// resolves (the ruling: becoming one later doesn't give first strike).

export default defineCard({
  name: "Vampire's Zeal",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. If it's a Vampire, it gains first strike until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Vampire" } },
        then: { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      },
    ],
  },
});
