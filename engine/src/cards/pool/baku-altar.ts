import { defineCard } from "../define.js";

// Betrayers of Kamigawa (BOK). EDHREC rank 21827.
const KI_TEXT = "Whenever you cast a Spirit or Arcane spell, you may put a ki counter on this artifact.";
const TOKEN_TEXT = "{2}, {T}, Remove a ki counter from this artifact: Create a 1/1 colorless Spirit creature token.";

export default defineCard({
  name: "Baku Altar",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${KI_TEXT}\n${TOKEN_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "ki", count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless)", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a ki counter on Baku Altar?",
        effect: { kind: "add-counter", target: "source", counter: "ki", amount: 1 },
      },
      resolve: null,
      text: KI_TEXT,
    },
  ],
});
