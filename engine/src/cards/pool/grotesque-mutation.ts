import { defineCard } from "../define.js";

export default defineCard({
  name: "Grotesque Mutation",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +3/+1 and gains lifelink until end of turn. (Damage dealt by the creature also causes its controller to gain that much life.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});
