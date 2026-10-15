import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 20000.
//
// Infusion as a static: Jetmir's anthem, gated on the `turn-stat` life you
// gained this turn (Withering Curse's infusion condition).

const INFUSION_TEXT =
  "Infusion — Creatures you control get +1/+0 and have trample as long as you gained life this turn.";

export default defineCard({
  name: "Thornfist Striker",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: `Ward {1} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\n${INFUSION_TEXT}`,
  triggered: [ward({ mana: "{1}" })],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: INFUSION_TEXT,
    },
  ],
});
