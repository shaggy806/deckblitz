import { defineCard } from "../define.js";

// EDHREC rank 24418. Hour of Devastation. Villainous Wealth's free casts,
// made during the resolution or not at all, each spell of mana value 5 or
// less (X is 0); then no land you control untaps during your next untap step,
// those that arrive later included (the rulings).
const TEXT =
  "Shuffle your library, then exile the top four cards. You may cast any number of spells with mana value 5 or less from among them without paying their mana costs. Lands you control don't untap during your next untap step.";

export default defineCard({
  name: "Hazoret's Undying Fury",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "shuffle-library" },
      { kind: "exile-from-library", whose: "you", amount: 4 },
      {
        kind: "cast-now",
        from: "exiled-this-way",
        free: true,
        repeat: true,
        spell: { manaValue: { op: "lte", n: 5 } },
      },
      { kind: "skip-next-untap", filter: { type: "land" } },
    ],
  },
});
