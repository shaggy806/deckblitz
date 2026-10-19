import { defineCard } from "../define.js";

// EDHREC rank 10265.
//
// Farewell's "exile all graveyards", then Ranger-Captain of Eos's prohibition
// for the rest of the turn over every player (yourself included), and the
// spell exiles itself as it resolves (`exileOnResolve` — Genesis Ultimatum).

const TEXT = "Exile all graveyards. Players can't cast noncreature spells this turn. Exile Calamity's Wake.";

export default defineCard({
  name: "Calamity's Wake",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  exileOnResolve: true,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile-graveyard", target: "each-player" },
      {
        kind: "prohibit",
        who: "each-player",
        spells: { filter: { notTypes: ["creature"] }, label: "noncreature spells" },
      },
    ],
  },
});
