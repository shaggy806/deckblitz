import { defineCard } from "../define.js";

// EDHREC rank 10932. Jace, Wielder of Mysteries' "then if your library has no
// cards in it, you win the game", checked as the ability resolves — before
// state-based actions could make you lose for the life or for drawing from
// an empty library (the reminder text).

const TEXT =
  "{T}: You draw a card and lose 1 life. Then if your library has no cards in it, you win the game.";

export default defineCard({
  name: "Doctor Doom, Unrivaled",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Sorcerer", "Villain"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${TEXT} (You win even if you have 0 life or didn't draw a card.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "library-size", who: "you", atMost: 0 },
            then: { kind: "win-game" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
