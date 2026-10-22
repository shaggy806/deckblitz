import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Ice Age (ICE). EDHREC rank 31438.

const UPKEEP = cumulativeUpkeep("{1}");

export default defineCard({
  name: "Fyndhorn Pollen",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${UPKEEP.text}\nAll creatures get -1/-0.\n{1}{G}: All creatures get -1/-0 until end of turn.`,
  triggered: [UPKEEP],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      grantPt: [-1, 0],
      text: "All creatures get -1/-0.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt-all", filter: { type: "creature" }, power: -1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{G}: All creatures get -1/-0 until end of turn.",
    },
  ],
});
