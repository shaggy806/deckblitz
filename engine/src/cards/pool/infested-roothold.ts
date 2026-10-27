import { defineCard } from "../define.js";

// EDHREC rank 23239.

export default defineCard({
  name: "Infested Roothold",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\nProtection from artifacts\nWhenever an opponent casts an artifact spell, you may create a 1/1 green Insect creature token.",
  static: [{ affects: { scope: "self" }, protection: { types: ["artifact"] }, text: "Protection from artifacts" }],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 green Insect creature token?",
        effect: { kind: "create-token", token: "Insect Token", count: 1 },
      },
      resolve: null,
      text: "Whenever an opponent casts an artifact spell, you may create a 1/1 green Insect creature token.",
    },
  ],
});
