import { defineCard } from "../define.js";

// EDHREC rank 13019.

export default defineCard({
  name: "Johann, Apprentice Sorcerer",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Sorcerer"],
  power: 2,
  toughness: 5,
  looksAtOwnLibraryTop: true,
  text: "You may look at the top card of your library any time.\nOnce each turn, you may cast an instant or sorcery spell from the top of your library. (You still pay its costs. Timing rules still apply.)",
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "library-top",
        filter: { typesAnyOf: ["instant", "sorcery"] },
        oncePerTurn: true,
      },
      text: "Once each turn, you may cast an instant or sorcery spell from the top of your library.",
    },
  ],
});
