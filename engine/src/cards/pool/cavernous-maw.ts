import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// EDHREC rank 15008.
// "The number of other Caves you control plus the number of Cave cards in your
// graveyard is three or greater" has no sum-of-counts condition, so it's the
// four ways two counts reach three, which is the same thing exactly.

const CAVE = { subtype: "Cave" } as const;
const otherCaves = (atLeast: number): StaticCondition => ({
  kind: "controls",
  filter: CAVE,
  atLeast,
  excludeSelf: true,
});
const caveCards = (atLeast: number): StaticCondition => ({ kind: "cards-in-graveyard", atLeast, filter: CAVE });

export default defineCard({
  name: "Cavernous Maw",
  colors: [],
  types: ["land"],
  subtypes: ["Cave"],
  text: "{T}: Add {C}.\n{2}: This land becomes a 3/3 Elemental creature until end of turn. It's still a Cave land. Activate only if the number of other Caves you control plus the number of Cave cards in your graveyard is three or greater.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: false },
      condition: {
        kind: "any",
        of: [
          caveCards(3),
          { kind: "all", of: [otherCaves(1), caveCards(2)] },
          { kind: "all", of: [otherCaves(2), caveCards(1)] },
          otherCaves(3),
        ],
      },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Elemental"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{2}: This land becomes a 3/3 Elemental creature until end of turn. It's still a Cave land. Activate only if the number of other Caves you control plus the number of Cave cards in your graveyard is three or greater.",
    },
  ],
});
