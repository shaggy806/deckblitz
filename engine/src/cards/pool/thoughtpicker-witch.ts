import { defineCard } from "../define.js";

const TEXT = "{1}, Sacrifice a creature: Look at the top two cards of target opponent's library, then exile one of them.";

export default defineCard({
  name: "Thoughtpicker Witch",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: ["opponent"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 2,
        min: 1,
        max: 1,
        destination: "exile",
        unlinked: true,
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
