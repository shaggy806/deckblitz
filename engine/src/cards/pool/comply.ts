import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

const FACES = ["Failure // Comply", "Failure", "Comply"];

// Rulings (2017-04-18): the name is chosen as Comply resolves; a land's name
// may be chosen (lands are played, not cast); one half of a split card only.

export default defineCard({
  name: "Comply",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Aftermath (Cast this spell only from your graveyard. Then exile it.)\nChoose a card name. Until your next turn, your opponents can't cast spells with the chosen name.",
  effect: {
    kind: "choose-card-name",
    then: {
      kind: "player-effect",
      duration: "until-your-next-turn",
      cantCast: { who: "each-opponent", filter: { hasName: CHOSEN_CARD_NAME }, label: "spells with the chosen name" },
    },
  },
  faces: FACES,
  split: true,
  aftermath: true,
});
