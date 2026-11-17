import { defineCard } from "../define.js";

// EDHREC rank 13384.
//
// "Exile all opponents' graveyards" is one move (`exile-graveyard` of
// `"each-opponent"`). "Choose a nonland card exiled this way" isn't
// targeted: a `look-and-choose` over the cards this resolution exiled
// (`zone: "exiled-this-way"`), one if there's any, the card staying where it
// is; its `then` gives that card the permission (`grant-play` of target 0),
// riding on the card, so it ends with any move (rule 400.7) and outlives
// this creature. "Mana as though it were mana of any color" is `spendAs:
// "any-color"` (rule 609.4b, so colorless mana still can't pay a coloured
// pip — Covetous Urge's).

const ENTER_TEXT =
  "When this creature enters, exile all opponents' graveyards. Choose a nonland card exiled this way. You may cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell.";

export default defineCard({
  name: "Author of Shadows",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shade", "Warlock"],
  power: 3,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-graveyard", target: "each-opponent" },
          {
            kind: "look-and-choose",
            zone: "exiled-this-way",
            filter: { notTypes: ["land"] },
            min: 1,
            max: 1,
            destination: "stay",
            leftover: "stay",
            prompt: "Choose a nonland card exiled this way — you may cast it for as long as it remains exiled",
            then: { kind: "grant-play", cards: 0, duration: "while-exiled", spendAs: "any-color" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
