import { defineCard } from "../define.js";

export default defineCard({
  name: "Nantuko Tracer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, you may put target card from a graveyard on the bottom of its owner's library.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any" }],
      effect: {
        kind: "may",
        prompt: "Put target card from a graveyard on the bottom of its owner's library?",
        effect: { kind: "put-on-library", target: 0, position: "bottom" },
      },
      resolve: null,
      text: "When this creature enters, you may put target card from a graveyard on the bottom of its owner's library.",
    },
  ],
});
