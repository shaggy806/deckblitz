import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 18231.
//
// "If you cast this spell during your main phase" is the addendum gate
// (Summary Judgment's): a cast spell — a copy wasn't cast, so it deals 2 —
// resolving in your main phase, which is the phase it was cast in, since a
// phase can't end with the spell still on the stack. The damage to creatures
// and players is one simultaneous event either way (Dakmor Plague's).

const blast = (n: number) =>
  ({
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage-all", filter: { type: "creature" }, amount: n },
      { kind: "damage", amount: n, who: "each-player" },
    ],
  }) as const;

export default defineCard({
  name: "Sulfurous Blast",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Sulfurous Blast deals 2 damage to each creature and each player. If you cast this spell during your main phase, Sulfurous Blast deals 3 damage to each creature and each player instead.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: {
      kind: "all",
      of: [
        { kind: "source", filter: { cast: true } },
        { kind: "your-turn" },
        { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
      ],
    },
    then: blast(3),
    else: blast(2),
  },
});
