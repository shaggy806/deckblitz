import { defineCard } from "../define.js";

// EDHREC rank 26530.

export default defineCard({
  name: "Minister of Pain",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 3,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, creatures your opponents control get -1/-1 until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exploit: sacrifice a creature?",
        effect: {
          kind: "sacrifice",
          who: "you",
          filter: { type: "creature" },
          count: 1,
          exploit: true,
        },
      },
      resolve: null,
      text: "Exploit",
    },
    {
      trigger: { on: "exploits", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "opponent" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature exploits a creature, creatures your opponents control get -1/-1 until end of turn.",
    },
  ],
});
