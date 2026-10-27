import { defineCard } from "../define.js";

// EDHREC rank 9545. Terrain Generator's put-a-land-from-hand shape, off an
// enters trigger.

const ETB_TEXT = "When this creature enters, you may put a basic land card from your hand onto the battlefield tapped.";

export default defineCard({
  name: "Elvish Pioneer",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 1,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { supertype: "basic", type: "land" },
        enterTapped: true,
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
