import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 22709.
export default defineCard({
  name: "Spoils of the Vault",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Choose a card name. Reveal cards from the top of your library until you reveal a card with that name, then put that card into your hand. Exile all other cards revealed this way, and you lose 1 life for each of the exiled cards.",
  effect: {
    kind: "choose-card-name",
    then: {
      kind: "sequence",
      effects: [
        { kind: "reveal-until", filter: { hasName: CHOSEN_CARD_NAME }, put: "hand", rest: "exile" },
        { kind: "lose-life", amount: { thisWay: "exiled" } },
      ],
    },
  },
});
