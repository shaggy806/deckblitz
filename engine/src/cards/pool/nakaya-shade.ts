import { defineCard } from "../define.js";

// EDHREC rank 30143. Each activation asks the table (rhystic: `chooser:
// "any-player"`) as it resolves.

const TEXT = "{B}: This creature gets +1/+1 until end of turn unless any player pays {2}.";

export default defineCard({
  name: "Nakaya Shade",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Shade"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "any-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
