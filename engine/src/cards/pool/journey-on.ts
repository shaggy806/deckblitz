import { defineCard } from "../define.js";

// Opponents who control an artifact, not artifacts (the ruling).
export default defineCard({
  name: "Journey On",
  art: "https://cards.scryfall.io/art_crop/back/0/1/01739030-c280-492b-a5c9-b3e9f6debc6d.jpg",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create X Map tokens, where X is one plus the number of opponents who control an artifact. (Then exile this card. You may cast the creature later from exile.)",
  faces: ["Kellan, Daring Traveler", "Journey On"],
  adventure: true,
  targets: [],
  effect: {
    kind: "create-token",
    token: "Map Token",
    count: {
      sum: [
        1,
        {
          countPlayers: "each-opponent",
          where: {
            kind: "of-player",
            player: "that-player",
            condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
          },
        },
      ],
    },
  },
});
