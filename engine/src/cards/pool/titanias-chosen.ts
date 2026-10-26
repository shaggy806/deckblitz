import { defineCard } from "../define.js";

// EDHREC rank 17401.

export default defineCard({
  name: "Titania's Chosen",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 1,
  text: "Whenever a player casts a green spell, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { colors: ["G"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever a player casts a green spell, put a +1/+1 counter on this creature.",
    },
  ],
});
