import { defineCard } from "../define.js";

// Torment. EDHREC rank 27293. Once per card discarded (`perCard`, each its
// trigger object, followed to the graveyard and no further — a madness card
// discarded into exile isn't there to return), Angelic Renewal's "you may
// sacrifice this. If you do, return that card".

const TEXT =
  "Whenever you discard a card, you may sacrifice this creature. If you do, return the discarded card from your graveyard to your hand.";

export default defineCard({
  name: "Pitchstone Wall",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 2,
  toughness: 5,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Pitchstone Wall to return the discarded card to your hand?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
