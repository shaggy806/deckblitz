import { defineCard } from "../define.js";

// A spell whose every target is a player; its new targets must be players too
// (`newTargetIs: "player"`), and legal for it (rule 115.7a). A spell that
// affects a player without the word "target" doesn't target one (the ruling).

export default defineCard({
  name: "Rebound",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Change the target of target spell that targets only a player. The new target must be a player.",
  targets: [{ kind: "spell", filter: { targets: { only: true, player: "any" } } }],
  effect: { kind: "change-targets", target: 0, how: "change", newTargetIs: "player" },
});
