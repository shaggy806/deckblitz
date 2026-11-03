import { defineCard } from "../define.js";

const CHOOSE = "As this creature enters, secretly choose an opponent.";
const REVEAL =
  "Reveal the player you chose: You and target permanent you control each gain protection from the chosen player until end of turn. Activate only once.";

export default defineCard({
  name: "Guardian Archon",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${CHOOSE}\n${REVEAL}`,
  choosePlayerOnEnter: "opponent",
  secretChoiceOnEnter: true,
  activated: [
    {
      cost: { mana: null, tap: false, revealChosen: true },
      onlyOnce: true,
      targets: [{ kind: "permanent", whose: "you", filter: {} }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "player-effect",
            duration: "end-of-turn",
            protectionFromPlayers: { who: "you", from: "chosen-player" },
          },
          { kind: "grant-protection", target: 0, from: { fromChosenPlayer: true }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: REVEAL,
    },
  ],
});
