import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 12802. "Sacrifice a Clue" is any Clue artifact (the rulings).
const ENTERS = "When Alquist Proft enters, investigate.";
const DRAW = "{X}{W}{U}{U}, {T}, Sacrifice a Clue: You draw X cards and gain X life.";

export default defineCard({
  name: "Alquist Proft, Master Sleuth",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTERS} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${DRAW}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{W}{U}{U}", tap: true, sacrifice: { filter: { subtype: "Clue" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: "x" },
          { kind: "gain-life", amount: "x" },
        ],
      },
      resolve: null,
      text: DRAW,
    },
  ],
});
