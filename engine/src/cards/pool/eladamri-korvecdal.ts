import { defineCard } from "../define.js";

// The last ability: which to reveal, a card from the hand or the top card of
// the library, is chosen as it resolves; a creature card revealed either way
// goes onto the battlefield. Rulings: a land creature can't be cast from the
// top (it isn't cast at all), and the spells cast from there follow every
// timing rule.

const LOOK_TEXT = "You may look at the top card of your library any time.";
const CAST_TEXT = "You may cast creature spells from the top of your library.";
const REVEAL_TEXT =
  "{G}, {T}, Tap two untapped creatures you control: Reveal a card from your hand or the top card of your library. If you reveal a creature card this way, put it onto the battlefield. Activate only during your turn.";
const putIfCreature = {
  kind: "conditional",
  condition: { kind: "target", index: 0, filter: { type: "creature" } },
  then: { kind: "put-onto-battlefield", target: 0 },
} as const;

export default defineCard({
  name: "Eladamri, Korvecdal",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${LOOK_TEXT}\n${CAST_TEXT}\n${REVEAL_TEXT}`,
  static: [
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK_TEXT },
    { affects: { scope: "self" }, mayPlay: { from: "library-top", filter: { type: "creature" } }, text: CAST_TEXT },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: true, tapOthers: { count: 2, filter: { type: "creature", controlledBy: "you" } } },
      condition: { kind: "your-turn" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Reveal a card from your hand",
            effect: {
              kind: "look-and-choose",
              zone: "hand",
              min: 1,
              max: 1,
              destination: "reveal",
              leftover: "stay",
              then: putIfCreature,
            },
          },
          { text: "Reveal the top card of your library", effect: { kind: "reveal-top", then: putIfCreature } },
        ],
      },
      resolve: null,
      text: REVEAL_TEXT,
    },
  ],
});
