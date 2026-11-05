import { defineCard } from "../define.js";

export default defineCard({
  name: "Conspicuous Snoop",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 2,
  text: "Play with the top card of your library revealed.\nYou may cast Goblin spells from the top of your library.\nAs long as the top card of your library is a Goblin card, this creature has all activated abilities of that card.",
  static: [
    {
      affects: { scope: "self" },
      visibility: { libraryTopRevealed: "you" },
      text: "Play with the top card of your library revealed.",
    },
    {
      affects: { scope: "self" },
      castFromLibraryTop: { filter: { subtype: "Goblin" } },
      text: "You may cast Goblin spells from the top of your library.",
    },
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "library-top", filter: { subtype: "Goblin" } },
      text: "As long as the top card of your library is a Goblin card, this creature has all activated abilities of that card.",
    },
  ],
});
