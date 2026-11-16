import { defineCard } from "../define.js";

export default defineCard({
  name: "_____ Bird Gets the Worm",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Guest"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you may put a name sticker on it. You gain X life, where X is the number of unique vowels on that sticker. (The vowels are A, E, I, O, U, and Y.)",
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
        then: { kind: "gain-life", amount: "x" },
      },
      text: "When this creature enters, you may put a name sticker on it. You gain X life, where X is the number of unique vowels on that sticker.",
    },
  ],
});
