import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 28865. Every player is bound, its caster included, until
// their next turn.

export default defineCard({
  name: "Conjurer's Ban",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text:
    "Choose a card name. Until your next turn, spells with the chosen name can't be cast and lands with the chosen name can't be played.\nDraw a card.",
  effect: {
    kind: "choose-card-name",
    then: {
      kind: "sequence",
      effects: [
        {
          kind: "player-effect",
          duration: "until-your-next-turn",
          cantCast: {
            who: "each-player",
            filter: { hasName: CHOSEN_CARD_NAME },
            label: "spells with the chosen name",
            lands: true,
          },
        },
        { kind: "draw", amount: 1 },
      ],
    },
  },
});
