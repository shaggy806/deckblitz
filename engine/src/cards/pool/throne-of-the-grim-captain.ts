import { defineCard } from "../define.js";

// EDHREC rank 15401.
const MILL_TEXT = "{T}: Mill two cards.";
const CRAFT_TEXT =
  "Craft with a Dinosaur, a Merfolk, a Pirate, and a Vampire {4} ({4}, Exile this artifact, Exile the four from among permanents you control and/or cards in your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "Throne of the Grim Captain",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${MILL_TEXT}\n${CRAFT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      cost: {
        mana: "{4}",
        tap: false,
        
        craft: {
          count: 4,
          oneEach: [{ subtype: "Dinosaur" }, { subtype: "Merfolk" }, { subtype: "Pirate" }, { subtype: "Vampire" }],
          text: "a Dinosaur, a Merfolk, a Pirate, and a Vampire",
        },
        do: { kind: "exile", target: "source" },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "craft-return" },
      resolve: null,
      text: "Craft with a Dinosaur, a Merfolk, a Pirate, and a Vampire {4}",
    },
  ],
  faces: ["Throne of the Grim Captain", "The Grim Captain"],
  transform: true,
});
