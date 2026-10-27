import { defineCard } from "../define.js";

// Apocalypse (APC). Goblin Ringleader's shape, for Zombies.
const TEXT =
  "When this creature enters, reveal the top four cards of your library. Put all Zombie cards revealed this way into your hand and the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Grave Defiler",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: `${TEXT}\n{1}{B}: Regenerate this creature.`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{B}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 4,
        max: 4,
        filter: { subtype: "Zombie" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
