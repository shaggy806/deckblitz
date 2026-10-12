import { defineCard } from "../define.js";

export default defineCard({
  name: "Rush of Vitality",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +1/+0 and gains lifelink and indestructible until end of turn. (Damage dealt by that creature also causes its controller to gain that much life, and it can't be destroyed by damage or effects that say \"destroy.\")",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
    ],
  },
});
