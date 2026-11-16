import { defineCard } from "../define.js";

// Its name has a blank line, which isn't a word (rule 123.6a): a name sticker
// put there fills it ("Hot Dog Goblin") — `stickers.ts`'s `nameWithSticker`.
export default defineCard({
  name: "_____ Goblin",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Guest"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, you may put a name sticker on it. Add {R} for each unique vowel on that sticker. (The vowels are A, E, I, O, U, and Y.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      resolve: null,
      effect: {
        kind: "put-sticker",
        sticker: "name",
        optional: true,
        count: "unique-vowels",
        then: { kind: "add-mana", mana: "R", amount: "x" },
      },
      text: "When this creature enters, you may put a name sticker on it. Add {R} for each unique vowel on that sticker.",
    },
  ],
});
