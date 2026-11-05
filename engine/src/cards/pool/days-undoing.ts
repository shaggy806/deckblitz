import { defineCard } from "../define.js";

// EDHREC rank 5768.

export default defineCard({
  name: "Day's Undoing",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Each player shuffles their hand and graveyard into their library, then draws seven cards. If it's your turn, end the turn. (Exile all spells and abilities from the stack, including this card. Discard down to your maximum hand size. Damage wears off, and \"this turn\" and \"until end of turn\" effects end.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [
          {
            kind: "shuffle-graveyard-into-library",
            target: "each-player",
            zones: ["hand", "graveyard"],
          },
          { kind: "draw", amount: 7, who: "each-player" },
        ],
      },
      { kind: "conditional", condition: { kind: "your-turn" }, then: { kind: "end-the-turn" } },
    ],
  },
});
