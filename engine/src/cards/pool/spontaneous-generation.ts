import { defineCard } from "../define.js";

export default defineCard({
  name: "Spontaneous Generation",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 1/1 green Saproling creature token for each card in your hand.",
  targets: [],
  effect: { kind: "create-token", token: "Saproling Token", count: { cardsInHand: "you" } },
});
