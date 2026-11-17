import { defineCard } from "../define.js";

// EDHREC rank 12423.
//
// Rulings:
//   Spelling this out completely: — Each opponent who controls more creatures than you can't play
//   creature cards. — Each opponent who controls more artifacts than you can't play artifact cards.
//   — Each opponent who controls more enchantments than you can't play enchantment cards. — Each
//   opponent who controls more lands than you can't play land cards.
//
// Each "can't" binds the opponents who control more of that type than its controller as the gate
// is read (`{ who: "opponents", controlsMore }`), so it comes and goes with the board.

const SPELLS_TEXT =
  "Each opponent who controls more creatures than you can't cast creature spells. The same is true for artifacts and enchantments.";
const LANDS_TEXT = "Each opponent who controls more lands than you can't play lands.";

const castFor = (type: "creature" | "artifact" | "enchantment") =>
  ({ act: "cast", who: { who: "opponents", controlsMore: { type } }, filter: { type } }) as const;

export default defineCard({
  name: "Ward of Bones",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: `${SPELLS_TEXT}\n${LANDS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [castFor("creature"), castFor("artifact"), castFor("enchantment")],
      text: SPELLS_TEXT,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "play-land", who: { who: "opponents", controlsMore: { type: "land" } } }],
      text: LANDS_TEXT,
    },
  ],
});
