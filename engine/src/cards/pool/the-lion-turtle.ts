import { defineCard } from "../define.js";

// EDHREC rank 12281. Ketramose's / The Ancient One's "can't attack or block
// unless", over Lesson cards in your graveyard.

const RESTRICT_TEXT =
  "The Lion-Turtle can't attack or block unless there are three or more Lesson cards in your graveyard.";

export default defineCard({
  name: "The Lion-Turtle",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Cat", "Turtle"],
  power: 3,
  toughness: 6,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\nWhen The Lion-Turtle enters, you gain 3 life.\n${RESTRICT_TEXT}\n{T}: Add one mana of any color.`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "not",
        of: { kind: "cards-in-graveyard", atLeast: 3, filter: { subtype: "Lesson" } },
      },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: "When The Lion-Turtle enters, you gain 3 life.",
    },
  ],
});
