import { defineCard } from "../define.js";

// Two independent optional slots; "Exile Retrieve" is part of its resolution
// (`exileOnResolve`), so a Retrieve that doesn't resolve isn't exiled.
export default defineCard({
  name: "Retrieve",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Return up to one target creature card and up to one target noncreature permanent card from your graveyard to your hand. Exile Retrieve.",
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
    {
      kind: "optional",
      of: {
        kind: "card-in-graveyard",
        whose: "you",
        filter: {
          typesAnyOf: ["artifact", "enchantment", "land", "planeswalker", "battle"],
          notTypes: ["creature"],
        },
      },
    },
  ],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
  exileOnResolve: true,
});
