import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// Top-5000 #894. With no such card left, the whole library is exiled and
// nothing else happens (the ruling).
export default defineCard({
  name: "Demonic Consultation",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose a card name. Exile the top six cards of your library, then reveal cards from the top of your library until you reveal a card with the chosen name. Put that card into your hand and exile all other cards revealed this way.",
  effect: {
    kind: "choose-card-name",
    then: {
      kind: "sequence",
      effects: [
        { kind: "exile-from-library", amount: 6 },
        { kind: "reveal-until", filter: { hasName: CHOSEN_CARD_NAME }, put: "hand", rest: "exile" },
      ],
    },
  },
});
