import { defineCard } from "../define.js";

const TEXT =
  "{1}{B}, {T}, Sacrifice a creature: Search your library for a Zombie card and a Swamp card, reveal them, put them into your hand, then shuffle.";

// Finding either card is optional (the ruling): min 0, one of each.
export default defineCard({
  name: "Corpse Harvester",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, sacrifice: { filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { subtypes: ["Zombie", "Swamp"] },
        destination: "hand",
        min: 0,
        max: 2,
        reveal: true,
        together: {
          oneEach: [
            { label: "a Zombie card", filter: { subtype: "Zombie" } },
            { label: "a Swamp card", filter: { subtype: "Swamp" } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
