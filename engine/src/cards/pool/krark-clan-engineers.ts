import { defineCard } from "../define.js";

// EDHREC rank 27642.

const TEXT = "{R}, Sacrifice two artifacts: Destroy target artifact.";

export default defineCard({
  name: "Krark-Clan Engineers",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Artificer"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: { filter: { type: "artifact" }, count: 2 } },
      targets: ["artifact"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
