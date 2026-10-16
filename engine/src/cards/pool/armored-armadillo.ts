import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 15551.
//
// X is its toughness as the ability resolves, fixed from then on (the ruling,
// rule 608.2h).
const PUMP = "{3}{W}: This creature gets +X/+0 until end of turn, where X is its toughness.";

export default defineCard({
  name: "Armored Armadillo",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Armadillo"],
  power: 0,
  toughness: 4,
  text: `Ward {1} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\n${PUMP}`,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { toughnessOf: "source" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP,
    },
  ],
  triggered: [ward({ mana: "{1}" })],
});
