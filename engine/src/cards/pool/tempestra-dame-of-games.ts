import { defineCard } from "../define.js";

// EDHREC rank 10813. Orthion's copy, less the legendary supertype (Quantum
// Misalignment's exception).

const COPY_TEXT =
  "{2}{R}, {T}, Sacrifice an artifact: Create a token that's a copy of another target creature you control, except it isn't legendary. It gains haste. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Tempestra, Dame of Games",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Illusion"],
  power: 1,
  toughness: 3,
  text: COPY_TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        exceptions: { removeSupertypes: ["legendary"] },
        gains: { keywords: ["haste"] },
        sacrificeAtEndStep: true,
      },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
