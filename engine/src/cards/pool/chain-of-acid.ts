import { defineCard } from "../define.js";

export default defineCard({
  name: "Chain of Acid",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target noncreature permanent. Then that permanent's controller may copy this spell and may choose a new target for that copy.",
  targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Copy Chain of Acid? (You may choose a new target for the copy.)",
        effect: { kind: "copy-spell", target: "source", newTargets: true },
      },
    ],
  },
});
