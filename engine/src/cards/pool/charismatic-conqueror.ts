import { defineCard } from "../define.js";

const TEXT =
  "Whenever an artifact or creature an opponent controls enters untapped, they may tap that permanent. If they don't, you create a 1/1 white Vampire creature token with lifelink.";

export default defineCard({
  name: "Charismatic Conqueror",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "opponent", tapped: false },
      },
      targets: [],
      // "They" is the opponent it entered under, whoever controls it by now.
      // Already tapped or gone as this resolves, they can't choose to tap it
      // (`mayBeDone`), so the Vampire comes (the card's ruling).
      effect: {
        kind: "each-player-may",
        who: "trigger-player",
        prompt: "Tap that permanent?",
        effect: { kind: "tap", target: "trigger-object" },
        ifDidnt: { kind: "create-token", token: "Lifelink Vampire Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
