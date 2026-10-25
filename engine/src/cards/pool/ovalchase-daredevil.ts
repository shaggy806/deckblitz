import { defineCard } from "../define.js";

const TEXT = "Whenever an artifact you control enters, you may return this card from your graveyard to your hand.";

// Bloodghast's shape: the trigger works only while the card is already in
// the graveyard as the artifact enters (the ruling).
export default defineCard({
  name: "Ovalchase Daredevil",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pilot"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Ovalchase Daredevil from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
