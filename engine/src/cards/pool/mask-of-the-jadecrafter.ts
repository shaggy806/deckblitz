import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// The Brothers' War. The token's X is the {X} paid to activate (`basePt`).
// Unearth always grants haste (rule 702.84a), even to a noncreature artifact
// whose reminder text leaves it out (the ruling).
const TOKEN_TEXT =
  "{X}, {T}, Sacrifice this artifact: Create an X/X colorless Golem artifact creature token. Activate only as a sorcery.";

export default defineCard({
  name: "Mask of the Jadecrafter",
  manaCost: "{2}",
  types: ["artifact"],
  text:
    `${TOKEN_TEXT}\nUnearth {2}{G} ({2}{G}: Return this card from your graveyard to the battlefield. ` +
    "Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{X}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "X/X Golem Token",
        count: 1,
        basePt: { power: "x", toughness: "x" },
      },
      resolve: null,
      text: TOKEN_TEXT,
      sorcerySpeed: true,
    },
    unearth("{2}{G}"),
  ],
});
