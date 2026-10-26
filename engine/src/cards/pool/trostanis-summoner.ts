import { defineCard } from "../define.js";

// One instruction, so the three tokens enter as one event (`simultaneous`).
const TEXT =
  "When this creature enters, create a 2/2 white Knight creature token with vigilance, a 3/3 green Centaur creature token, and a 4/4 green Rhino creature token with trample.";

export default defineCard({
  name: "Trostani's Summoner",
  manaCost: "{5}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "create-token", token: "Knight Token", count: 1 },
          { kind: "create-token", token: "3/3 Centaur Token", count: 1 },
          { kind: "create-token", token: "Rhino Token", count: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
