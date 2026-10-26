import { defineCard } from "../define.js";

// EDHREC rank 19283.
export default defineCard({
  name: "Windstorm",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Windstorm deals X damage to each creature with flying.",
  targets: [],
  effect: { kind: "damage-all", filter: { type: "creature", keyword: "flying" }, amount: "x" },
});
