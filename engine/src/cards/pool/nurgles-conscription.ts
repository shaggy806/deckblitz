import { defineCard } from "../define.js";

// "That player" is the card's owner, whose graveyard it was in.

export default defineCard({
  name: "Nurgle's Conscription",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Put target creature card from an opponent's graveyard onto the battlefield tapped under your control, " +
    "then exile that player's graveyard.",
  targets: [{ kind: "card-in-graveyard", whose: "opponent", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0, underYourControl: true, enterTapped: true },
      { kind: "exile-graveyard", target: { ownerOf: 0 } },
    ],
  },
});
