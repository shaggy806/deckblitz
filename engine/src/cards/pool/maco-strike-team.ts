import { defineCard } from "../define.js";

const TEXT =
  "Whenever a creature you control becomes the target of a spell or ability an opponent controls, create a tapped 1/1 red Officer creature token.";

export default defineCard({
  name: "MACO Strike Team",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", filter: { type: "creature" }, byOpponentOnly: true },
      targets: [],
      effect: { kind: "create-token", token: "Officer Token", count: 1, tapped: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
