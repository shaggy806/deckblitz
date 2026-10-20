import { defineCard } from "../define.js";

// "Is also a Cleric, Rogue, Warrior, and Wizard" is a CDA in every zone
// (`alsoSubtypes`). The revealed card must share a creature type with the
// Paragon — Elf or any of those four — read off it as the trigger resolves.

const ENTER_TEXT =
  "When this creature enters, if it was kicked, reveal the top six cards of your library. You may put a card that shares a creature type with it from among them into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Tajuru Paragon",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  alsoSubtypes: ["Cleric", "Rogue", "Warrior", "Wizard"],
  power: 3,
  toughness: 2,
  text: `Tajuru Paragon is also a Cleric, Rogue, Warrior, and Wizard.\nKicker {3}\n${ENTER_TEXT}`,
  kicker: { cost: "{3}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: true,
        min: 0,
        max: 1,
        filter: { sharesCreatureTypeWith: "trigger-object" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
