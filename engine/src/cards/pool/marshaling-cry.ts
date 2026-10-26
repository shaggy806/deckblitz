import { defineCard } from "../define.js";

// EDHREC rank 24566.

export default defineCard({
  name: "Marshaling Cry",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  flashback: { cost: "{3}{W}" },
  text: "Creatures you control get +1/+1 and gain vigilance until end of turn.\nCycling {2} ({2}, Discard this card: Draw a card.)\nFlashback {3}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "vigilance",
        duration: "end-of-turn",
      },
    ],
  },
});
