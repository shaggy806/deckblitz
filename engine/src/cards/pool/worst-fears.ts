import { defineCard } from "../define.js";

export default defineCard({
  name: "Worst Fears",
  manaCost: "{7}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You control target player during that player's next turn. Exile Worst Fears. (You see all cards that player could see and make all decisions for them.)",
  targets: ["player"],
  effect: { kind: "control-player", target: 0 },
  exileOnResolve: true,
});
