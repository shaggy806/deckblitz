import { defineCard } from "../define.js";

const TEXT =
  "Each creature your opponents control is an Illusion in addition to its other types and has \"When this creature becomes the target of a spell or ability, sacrifice it.\"";
const OPPONENTS_CREATURES = { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } } as const;

export default defineCard({
  name: "Dismiss into Dream",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    { affects: OPPONENTS_CREATURES, addSubtypes: ["Illusion"], text: TEXT },
    {
      affects: OPPONENTS_CREATURES,
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self" },
          targets: [],
          effect: { kind: "sacrifice-source" },
          resolve: null,
          text: "When this creature becomes the target of a spell or ability, sacrifice it.",
        },
      ],
      text: TEXT,
    },
  ],
});
