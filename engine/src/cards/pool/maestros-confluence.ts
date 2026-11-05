import { defineCard } from "../define.js";

// EDHREC rank 15411.

export default defineCard({
  name: "Maestros Confluence",
  manaCost: "{3}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["sorcery"],
  text: "Choose three. You may choose the same mode more than once.\n• Return target monocolored instant or sorcery card from your graveyard to your hand.\n• Target creature gets -3/-3 until end of turn.\n• Goad each creature target player controls. (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)",
  targets: [],
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: "Return target monocolored instant or sorcery card from your graveyard to your hand.",
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { typesAnyOf: ["instant", "sorcery"], colorless: false, multicolored: false },
          },
        ],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Target creature gets -3/-3 until end of turn.",
        targets: ["creature"],
        effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      },
      { text: "Goad each creature target player controls.", targets: ["player"], effect: { kind: "goad", target: 0 } },
    ],
  },
});
