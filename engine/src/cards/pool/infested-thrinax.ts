import { defineCard } from "../define.js";

// EDHREC rank 12670.
// Makes Saproling → use "Saproling Token".
// The enters ability sets up a delayed triggered ability for the rest of the
// turn (rule 603.7c); the dead creature's power is as it last existed on the
// battlefield (the ruling).
const TEXT =
  "When this creature enters, until end of turn, whenever a nontoken creature you control dies, create a number of 1/1 green Saproling creature tokens equal to that creature's power.";

export default defineCard({
  name: "Infested Thrinax",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 4,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "dies", who: "you-control", filter: { type: "creature", token: false } } },
        effect: { kind: "create-token", token: "Saproling Token", count: { powerOf: "trigger-object" } },
        text: "Whenever a nontoken creature you control dies, create a number of 1/1 green Saproling creature tokens equal to that creature's power.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
