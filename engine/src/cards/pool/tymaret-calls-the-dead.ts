import { defineCard } from "../define.js";

// Theros Beyond Death. The card exiled for chapters I and II may be one just
// milled, and only one per chapter (its rulings): a `may` of a one-card
// graveyard choice, then the Zombie only if a card was exiled this way.

const CHAPTER_I_II =
  "I, II — Mill three cards. Then you may exile a creature or enchantment card from your graveyard. If you do, create a 2/2 black Zombie creature token.";
const CHAPTER_III = "III — You gain X life and scry X, where X is the number of Zombies you control.";

const ZOMBIES = { countOf: { subtype: "Zombie", controlledBy: "you" } } as const;

export default defineCard({
  name: "Tymaret Calls the Dead",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "may",
            prompt: "Exile a creature or enchantment card from your graveyard?",
            effect: {
              kind: "sequence",
              effects: [
                {
                  kind: "look-and-choose",
                  zone: "graveyard",
                  min: 1,
                  max: 1,
                  filter: { typesAnyOf: ["creature", "enchantment"] },
                  destination: "exile",
                  leftover: "stay",
                },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "exiled", atLeast: 1 },
                  then: { kind: "create-token", token: "Zombie Token", count: 1 },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_I_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: ZOMBIES },
          { kind: "scry", amount: ZOMBIES },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
