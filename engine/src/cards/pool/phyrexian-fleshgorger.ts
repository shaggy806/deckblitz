import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 9992. Prototype (rule 718) is `prototype`: cast for {1}{B}{B}
// it's a black 3/3 on the stack and the battlefield, a colorless 7/5
// everywhere else. Ward's life is its power as the ward ability resolves —
// 3 for a prototyped one, pumps counted — or as it last existed if it has
// left (rule 702.21b, the ruling; `payLifeAmount`, 608.2h).

const WARD_TEXT = "Ward—Pay life equal to this creature's power.";

export default defineCard({
  name: "Phyrexian Fleshgorger",
  manaCost: "{7}",
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Wurm"],
  power: 7,
  toughness: 5,
  keywords: ["menace", "lifelink"],
  text:
    "Prototype {1}{B}{B} — 3/3 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\n" +
    `Menace, lifelink\n${WARD_TEXT}`,
  prototype: { cost: "{1}{B}{B}", power: 3, toughness: 3 },
  triggered: [
    {
      ...ward({ payLifeAmount: { powerOf: "source" }, text: "Pay life equal to this creature's power" }),
      text: WARD_TEXT,
    },
  ],
});
