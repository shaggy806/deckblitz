import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks and isn't blocked, look at the top card of defending player's library. You may put that card on the bottom of that player's library.";

export default defineCard({
  name: "Coral Fighters",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        from: "trigger-player",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        destination: "library-bottom",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
