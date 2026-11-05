import { defineCard } from "../define.js";

const BLOCKS =
  "Whenever this creature blocks, flip a coin. If you lose the flip, remove this creature from combat and it can't block this turn. Creatures it was blocking that had become blocked by only this creature this combat become unblocked.";

export default defineCard({
  name: "Ydwen Efreet",
  manaCost: "{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet"],
  power: 3,
  toughness: 6,
  text: BLOCKS,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: {
        kind: "flip-coin",
        lost: {
          kind: "sequence",
          effects: [
            { kind: "remove-from-combat", target: "source", unblockSoleBlocked: true },
            { kind: "restrict", target: "source", restrictions: ["cant-block"], duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: BLOCKS,
    },
  ],
});
