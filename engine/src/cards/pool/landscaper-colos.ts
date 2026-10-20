import { defineCard } from "../define.js";

const ENTERS =
  "When this creature enters, put target card from an opponent's graveyard on the bottom of their library.";

export default defineCard({
  name: "Landscaper Colos",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Goat", "Beast"],
  power: 4,
  toughness: 6,
  cycling: { cost: "{1}{W}", search: { supertype: "basic", type: "land" } },
  text: `${ENTERS}\nBasic landcycling {1}{W} ({1}{W}, Discard this card: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "opponent" }],
      // The card goes to its owner's library — the opponent whose graveyard it was in.
      effect: { kind: "put-on-library", target: 0, position: "bottom" },
      resolve: null,
      text: ENTERS,
    },
  ],
});
