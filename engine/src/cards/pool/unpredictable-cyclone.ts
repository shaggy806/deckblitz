import { defineCard } from "../define.js";

// The draw a cycling ability of a nonland card would make becomes the effect
// (`would-draw` `byCyclingOf`, rule 614.1a); the cycled card, in its
// graveyard, is the effect's `"trigger-object"`. "Another" holds by itself:
// this enchantment's own cycling starts in a hand, where its static doesn't
// work. What isn't cast, the card found included, goes to the bottom.
const TEXT =
  "If a cycling ability of another nonland card would cause you to draw a card, instead exile cards from the top of your library until you exile a card that shares a card type with the cycled card. You may cast that card without paying its mana cost. Then put the exiled cards that weren't cast this way on the bottom of your library in a random order.";

export default defineCard({
  name: "Unpredictable Cyclone",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "you",
        byCyclingOf: { notTypes: ["land"] },
        instead: {
          effect: {
            kind: "reveal-until",
            filter: { sharesCardTypeWith: "trigger-object" },
            exile: true,
            then: { kind: "cast-now", target: 0, free: true },
            rest: "bottom-random",
          },
        },
      },
      text: TEXT,
    },
  ],
  cycling: { cost: "{2}" },
});
