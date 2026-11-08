import { defineCard } from "../define.js";

// Tlincalli Hunter's Adventure.
export default defineCard({
  name: "Retrieve Prey",
  art: "https://scryfall.com/card/clb/682",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Exile target creature card from your graveyard. Until the end of your next turn, you may cast that card. (Then exile this card. You may cast the creature later from exile.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "exile", target: 0, mayPlay: { duration: "until-end-of-your-next-turn" } },
  faces: ["Tlincalli Hunter", "Retrieve Prey"],
  adventure: true,
});
