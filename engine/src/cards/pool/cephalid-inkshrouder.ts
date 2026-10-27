import { defineCard } from "../define.js";

// Judgment (JUD). EDHREC rank 15773.

const TEXT = "Discard a card: This creature gains shroud until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Cephalid Inkshrouder",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 2,
  toughness: 1,
  text: `${TEXT} (A creature with shroud can't be the target of spells or abilities.)`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "shroud", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
