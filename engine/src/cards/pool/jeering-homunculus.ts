import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you may goad target creature.";

export default defineCard({
  name: "Jeering Homunculus",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 0,
  toughness: 4,
  text: `${TEXT} (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "may", prompt: "Goad that creature?", effect: { kind: "goad", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
