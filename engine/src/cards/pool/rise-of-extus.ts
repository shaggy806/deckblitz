import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// EDHREC rank 29211. Learn is `learn()` (AUTHORING.md, "learn").
export default defineCard({
  name: "Rise of Extus",
  manaCost: "{4}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Exile target creature. Exile up to one target instant or sorcery card from a graveyard.\nLearn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)",
  targets: [
    "creature",
    {
      kind: "optional",
      of: { kind: "card-in-graveyard", filter: { typesAnyOf: ["instant", "sorcery"] } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [{ kind: "exile", target: 0 }, { kind: "exile", target: 1 }, learn()],
  },
});
