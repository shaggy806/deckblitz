import { defineCard } from "../define.js";

// EDHREC rank 18649.
// Makes Ninja → use "Ninja Token (Dark Leo & Shredder)".

export default defineCard({
  name: "Foot Mystic",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Ninja", "Warlock"],
  power: 2,
  toughness: 4,
  keywords: ["lifelink"],
  text: "Lifelink\nDisappear — When this creature enters, if a permanent left the battlefield under your control this turn, create a 1/1 black Ninja creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Ninja Token (Dark Leo & Shredder)", count: 1 },
      resolve: null,
      text: "Disappear — When this creature enters, if a permanent left the battlefield under your control this turn, create a 1/1 black Ninja creature token.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
