import { defineCard } from "../define.js";

const OOZE_TEXT = "Creatures you control have base power and toughness 6/6 and are Oozes in addition to their other types.";
const TOKEN_TEXT = "Whenever an opponent casts a spell, if it's not their turn, you create a 3/3 green Elephant creature token.";

export default defineCard({
  name: "March of the World Ooze",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${OOZE_TEXT}\n${TOKEN_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      setBasePt: { power: 6, toughness: 6 },
      addSubtypes: ["Ooze"],
      text: OOZE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      condition: { kind: "of-player", player: "that-player", condition: { kind: "not", of: { kind: "your-turn" } } },
      targets: [],
      effect: { kind: "create-token", token: "Elephant Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
});
