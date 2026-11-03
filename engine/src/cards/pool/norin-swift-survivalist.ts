import { defineCard } from "../define.js";

export default defineCard({
  name: "Norin, Swift Survivalist",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Coward"],
  power: 2,
  toughness: 1,
  text: "Norin can't block.\nWhenever a creature you control becomes blocked, you may exile it. You may play that card from exile this turn.",
  static: [
    {
      affects: { scope: "self" },
      text: "Norin can't block.",
      restrictions: ["cant-block"],
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control" },
      resolve: null,
      text: "Whenever a creature you control becomes blocked, you may exile it. You may play that card from exile this turn.",
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile the blocked creature? You may play that card from exile this turn.",
        effect: { kind: "exile", target: "trigger-object", mayCast: { duration: "end-of-turn", play: true } },
      },
    },
  ],
});
