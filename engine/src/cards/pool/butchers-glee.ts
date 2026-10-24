import { defineCard } from "../define.js";

export default defineCard({
  name: "Butcher's Glee",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets +3/+0 and gains lifelink until end of turn. Regenerate it. (Damage dealt by a creature with lifelink also causes its controller to gain that much life.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      { kind: "regenerate", target: 0 },
    ],
  },
});
