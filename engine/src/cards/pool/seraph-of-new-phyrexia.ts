import { defineCard } from "../define.js";

// Back face of Seraph of New Capenna // Seraph of New Phyrexia.
//
// Rulings:
//   [2023-04-14] Any player may respond to Seraph of New Phyrexia’s triggered ability, but once
//     that ability starts to resolve, no player may take any actions between you deciding to
//     sacrifice another creature or artifact and Seraph of New Phyrexia getting +2/+1.
//
// Comet Crawler's shape: the sacrifice is chosen and the bonus applied in one
// resolution.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may sacrifice another creature or artifact. If you do, this creature gets +2/+1 until end of turn.";

export default defineCard({
  name: "Seraph of New Phyrexia",
  art: "https://cards.scryfall.io/art_crop/back/f/b/fbd9ed1d-1972-4db8-bc43-b05b94956aa0.jpg",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "artifact"] },
            exceptSource: true,
            text: "Sacrifice another creature or artifact",
          },
        ],
        ifDid: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Seraph of New Capenna", "Seraph of New Phyrexia"],
  transform: true,
});
