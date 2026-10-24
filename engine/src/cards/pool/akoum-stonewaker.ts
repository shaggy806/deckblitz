import { defineCard } from "../define.js";

const TEXT =
  "Landfall — Whenever a land you control enters, you may pay {2}{R}. If you do, create a 3/1 red Elemental creature token with trample and haste. Exile that token at the beginning of the next end step.";

export default defineCard({
  name: "Akoum Stonewaker",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{R} to create a 3/1 Elemental token?",
        cost: "{2}{R}",
        effect: { kind: "create-token", token: "3/1 Red Elemental Token", count: 1, exileAtEndStep: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
