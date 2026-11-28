import { defineCard } from "../define.js";
import { learn } from "../helpers.js";

// Strixhaven: School of Mages (STX). EDHREC rank 26479.
//
// "If you cast it" is Iridescent Tiger's intervening if (rule 603.4). The last
// ability works only from its owner's graveyard (`fromGraveyard`, rule
// 113.6b): a `would-learn` replacement that `learn()`'s instruction offers
// beside learning itself (a "you may", rule 616.1). It returns under its
// owner's control; with two Phoenixes there, one learn returns only one, as
// the learn it replaced is gone.

const ETB_TEXT = "When this creature enters, if you cast it, learn. (You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card.)";
const RETURN_TEXT =
  "As long as this card is in your graveyard, if you would learn, you may instead return this card to the battlefield.";

export default defineCard({
  name: "Retriever Phoenix",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ETB_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      fromGraveyard: true,
      replacement: {
        event: "would-learn",
        optional: true,
        offer: "Return Retriever Phoenix to the battlefield instead",
        instead: { effect: { kind: "put-onto-battlefield", target: "source" } },
      },
      text: RETURN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: learn(),
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
