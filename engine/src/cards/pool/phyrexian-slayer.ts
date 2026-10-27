import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 30642. Ogre Leadfoot's blocked-by trigger,
// narrowed to white blockers, with "it can't be regenerated".
const TEXT =
  "Whenever this creature becomes blocked by a white creature, destroy that creature. It can't be regenerated.";

export default defineCard({
  name: "Phyrexian Slayer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Minion"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { colors: ["W"] } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object", cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
