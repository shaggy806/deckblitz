import { defineCard } from "../define.js";

// EDHREC rank 24461. Affectionate Indrik's trigger: the target is chosen as it
// goes on the stack, whether to fight as it resolves (the ruling).

export default defineCard({
  name: "Somberwald Stag",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elk"],
  power: 4,
  toughness: 3,
  text: "When this creature enters, you may have it fight target creature you don't control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Have Somberwald Stag fight the target creature?",
        effect: { kind: "fight", a: "source", b: 0 },
      },
      resolve: null,
      text: "When this creature enters, you may have it fight target creature you don't control.",
    },
  ],
});
