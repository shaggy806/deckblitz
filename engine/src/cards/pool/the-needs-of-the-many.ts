import { defineCard } from "../define.js";

// EDHREC rank 27826.

export default defineCard({
  name: "The Needs of the Many",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice a creature.\nCreatures you control gain hexproof and indestructible until end of turn. You gain hexproof until end of turn. Prevent all damage that would be dealt to you this turn. Exile The Needs of the Many.",
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "hexproof",
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      { kind: "grant-player-hexproof" },
      { kind: "damage-rule", to: { players: "you" } },
    ],
  },
  exileOnResolve: true,
});
