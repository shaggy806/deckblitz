import { defineCard } from "../define.js";

export default defineCard({
  name: "Vizkopa Guildmage",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{1}{W}{B}: Target creature gains lifelink until end of turn.\n{1}{W}{B}: Whenever you gain life this turn, each opponent loses that much life.",
  activated: [
    {
      cost: { mana: "{1}{W}{B}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}{B}: Target creature gains lifelink until end of turn.",
    },
    {
      cost: { mana: "{1}{W}{B}", tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        text: "Whenever you gain life this turn, each opponent loses that much life.",
        at: { whenever: { on: "gains-life", who: "you" } },
        effect: { kind: "lose-life", amount: { triggerValue: true }, who: "each-opponent" },
      },
      resolve: null,
      text: "{1}{W}{B}: Whenever you gain life this turn, each opponent loses that much life.",
    },
  ],
});
