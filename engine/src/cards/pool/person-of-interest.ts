import { defineCard } from "../define.js";

// If this creature has left the battlefield by the time the ability resolves,
// the suspect finds nothing but the Detective is still created (the ruling).

const ENTER_TEXT = "When this creature enters, suspect it. Create a 2/2 white and blue Detective creature token.";

export default defineCard({
  name: "Person of Interest",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT} (A suspected creature has menace and can't block.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "suspect", target: "source" },
          { kind: "create-token", token: "Detective Token", count: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
