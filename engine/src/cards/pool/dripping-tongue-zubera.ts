import { defineCard } from "../define.js";

export default defineCard({
  name: "Dripping-Tongue Zubera",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Zubera", "Spirit"],
  power: 1,
  toughness: 2,
  text: "When this creature dies, create a 1/1 colorless Spirit creature token for each Zubera that died this turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: { turnHistory: "died", who: "each-player", filter: { subtype: "Zubera" } } },
      resolve: null,
      text: "When this creature dies, create a 1/1 colorless Spirit creature token for each Zubera that died this turn.",
    },
  ],
});
