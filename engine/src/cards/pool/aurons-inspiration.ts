import { defineCard } from "../define.js";

// EDHREC rank 18516.
//
// Every attacking creature, whoever controls it, fixed as it resolves (rule
// 611.2c).

const TEXT = "Attacking creatures get +2/+0 until end of turn.";

export default defineCard({
  name: "Auron's Inspiration",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  flashback: { cost: "{2}{W}{W}" },
  text: `${TEXT}\nFlashback {2}{W}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", attacking: true },
    power: 2,
    toughness: 0,
    duration: "end-of-turn",
  },
});
