import { defineCard } from "../define.js";

// EDHREC rank 19788. Ikoria: Lair of Behemoths.

export default defineCard({
  name: "Survivors' Bond",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Return target Human creature card from your graveyard to your hand.\n• Return target non-Human creature card from your graveyard to your hand.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", subtype: "Human" } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
        text: "Return target Human creature card from your graveyard to your hand.",
      },
      {
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", notSubtypes: ["Human"] } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
        text: "Return target non-Human creature card from your graveyard to your hand.",
      },
    ],
  },
});
