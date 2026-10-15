import { defineCard } from "../define.js";

// Glarb's shape: looking at the top card any time is `looksAtOwnLibraryTop`,
// the cast permission a `castFromLibraryTop` judged as the spell it would be
// (a Spider spell, or any noncreature spell — never a land, which is played,
// not cast). Normal timing applies (the ruling).
const LOOK_TEXT = "You may look at the top card of your library any time.";
const CAST_TEXT = "You may cast Spider spells and noncreature spells from the top of your library.";
const MILL_TEXT = "Whenever you attack, you may mill a card. (You may put the top card of your library into your graveyard.)";

export default defineCard({
  name: "Madame Web, Clairvoyant",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Advisor"],
  power: 4,
  toughness: 4,
  text: `${LOOK_TEXT}\n${CAST_TEXT}\n${MILL_TEXT}`,
  looksAtOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      castFromLibraryTop: { filter: { anyOf: [{ subtype: "Spider" }, { notTypes: ["creature"] }] } },
      text: CAST_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Mill a card?",
        effect: { kind: "mill", target: "you", amount: 1 },
      },
      resolve: null,
      text: "Whenever you attack, you may mill a card.",
    },
  ],
});
