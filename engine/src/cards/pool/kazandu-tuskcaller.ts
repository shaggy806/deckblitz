import { defineCard } from "../define.js";
import { levelBand, levelStatic, levelUp } from "../helpers.js";

// EDHREC rank 14574.

const ONE_TEXT = "{T}: Create a 3/3 green Elephant creature token.";
const TWO_TEXT = "{T}: Create two 3/3 green Elephant creature tokens.";

export default defineCard({
  name: "Kazandu Tuskcaller",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: `Level up {1}{G} ({1}{G}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 2-5\n1/1\n${ONE_TEXT}\nLEVEL 6+\n1/1\n${TWO_TEXT}`,
  activated: [
    levelUp("{1}{G}"),
    {
      cost: { mana: null, tap: true },
      condition: levelBand(2, 5),
      targets: [],
      effect: { kind: "create-token", token: "Elephant Token", count: 1 },
      resolve: null,
      text: ONE_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      condition: levelBand(6),
      targets: [],
      effect: { kind: "create-token", token: "Elephant Token", count: 2 },
      resolve: null,
      text: TWO_TEXT,
    },
  ],
  static: [levelStatic(levelBand(2, 5), 1, 1, "LEVEL 2-5\n1/1"), levelStatic(levelBand(6), 1, 1, "LEVEL 6+\n1/1")],
});
