import { defineCard } from "../define.js";

export default defineCard({
  name: "Mortal's Ardor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +1/+1 and gains lifelink until end of turn. (Damage dealt by the creature also causes its controller to gain that much life.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});
