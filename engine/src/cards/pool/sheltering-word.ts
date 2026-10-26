import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 10975. The toughness is read as the spell
// resolves, after the hexproof grant.

export default defineCard({
  name: "Sheltering Word",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gains hexproof until end of turn. You gain life equal to that creature's toughness. (A creature with hexproof can't be the target of spells or abilities your opponents control.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      { kind: "gain-life", amount: { toughnessOf: 0 } },
    ],
  },
});
