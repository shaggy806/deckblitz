import { defineCard } from "../define.js";

// EDHREC rank 22910.
//
// Rulings:
//   [2025-04-04] If Furious Forebear dies at the same time as one or more creatures you control,
//     its ability won’t trigger.
//   [2025-04-04] If Furious Forebear leaves your graveyard before its ability resolves, it won’t
//     be returned to your hand even if you pay {1}{W}.

const RETURN_TEXT =
  "Whenever a creature you control dies while this card is in your graveyard, you may pay {1}{W}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Furious Forebear",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Warrior"],
  power: 3,
  toughness: 1,
  text: RETURN_TEXT,
  triggered: [
    {
      // Works only from the graveyard (rule 113.6k); a creature dying
      // alongside it isn't seen (the first ruling — `fromGraveyard`).
      fromGraveyard: true,
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
      targets: [],
      // "Source" is the card only while it's the same object (rule 400.7):
      // gone from the graveyard, paying returns nothing (the second ruling).
      effect: {
        kind: "may",
        prompt: "Pay {1}{W} to return Furious Forebear to your hand?",
        cost: "{1}{W}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
