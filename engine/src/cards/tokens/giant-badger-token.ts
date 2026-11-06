import { defineCard } from "../define.js";

/** The Giant Badger token (Greensleeves): a copy of the card Giant Badger —
 * named Giant Badger, its {1}{G}{G} mana cost and all. */
const BLOCKS = "Whenever this token blocks, it gets +2/+2 until end of turn.";

export default defineCard({
  name: "Giant Badger Token",
  tokenName: "Giant Badger",
  art: "10e9dd66-8580-4c96-9ab9-cc392dc6ee74",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Badger"],
  power: 2,
  toughness: 2,
  text: `${BLOCKS}\n(This token's mana cost is {1}{G}{G}.)`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: BLOCKS,
    },
  ],
});
