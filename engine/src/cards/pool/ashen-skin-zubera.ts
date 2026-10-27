import { defineCard } from "../define.js";

export default defineCard({
  name: "Ashen-Skin Zubera",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zubera", "Spirit"],
  power: 1,
  toughness: 2,
  text: "When this creature dies, target opponent discards a card for each Zubera that died this turn.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["opponent"],
      effect: { kind: "discard", target: 0, amount: { turnHistory: "died", who: "each-player", filter: { subtype: "Zubera" } } },
      resolve: null,
      text: "When this creature dies, target opponent discards a card for each Zubera that died this turn.",
    },
  ],
});
