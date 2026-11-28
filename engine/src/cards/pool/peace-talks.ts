import { defineCard } from "../define.js";

// EDHREC rank 27444.

const TEXT =
  "This turn and next turn, creatures can't attack, and players and permanents can't be the targets of spells or activated abilities.";

export default defineCard({
  name: "Peace Talks",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "restrict", filter: { type: "creature" }, restrictions: ["cant-attack"], duration: "until-end-of-next-turn" },
      {
        kind: "prohibit",
        prohibits: [
          {
            act: "be-targeted",
            who: "each-player",
            object: { inZone: "battlefield" },
            only: "spells-and-activated",
          },
        ],
        duration: "until-end-of-next-turn",
      },
    ],
  },
  targets: [],
});
