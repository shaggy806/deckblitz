import { defineCard } from "../define.js";

// Fallen Empires (FEM). EDHREC rank 29033.
//
// The target is chosen as the trigger goes on the stack, from the creatures
// of the player Necrite attacks; "if you do" is the sacrifice's own tail.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may sacrifice it. If you do, destroy target creature defending player controls. It can't be regenerated.";

export default defineCard({
  name: "Necrite",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Thrull"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: ["creature-defending-player-controls"],
      effect: {
        kind: "may",
        prompt: "Sacrifice Necrite to destroy the targeted creature?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "destroy", target: 0, cantBeRegenerated: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
