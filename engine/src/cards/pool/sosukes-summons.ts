import { defineCard } from "../define.js";

// EDHREC rank 14059.

const TEXT = "Whenever a nontoken Snake you control enters, you may return this card from your graveyard to your hand.";

export default defineCard({
  name: "Sosuke's Summons",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Create two 1/1 green Snake creature tokens.\n${TEXT}`,
  targets: [],
  effect: { kind: "create-token", token: "Snake Token", count: 2 },
  triggered: [
    {
      // Ovalchase Daredevil's graveyard trigger.
      fromGraveyard: true,
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { token: false, subtype: "Snake" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Sosuke's Summons from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
