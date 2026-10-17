import { defineCard } from "../define.js";

export default defineCard({
  name: "Rush the Room",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature gets +1/+0 and gains first strike until end of turn. If it's a Goblin or Orc, it also gains haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { anyOf: [{ subtype: "Goblin" }, { subtype: "Orc" }] } },
        then: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      },
    ],
  },
});
