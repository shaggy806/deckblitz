import { defineCard } from "../define.js";

// EDHREC rank 6639.
//
// X is chosen as it's cast; the Zombies are sacrificed as it resolves (fewer
// if there aren't X), and the reveal counts the ones actually sacrificed. The
// Zombie creature cards found enter together (its ruling).

export default defineCard({
  name: "Empty the Laboratory",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Sacrifice X Zombies, then reveal cards from the top of your library until you reveal a number of Zombie creature cards equal to the number of Zombies sacrificed this way. Put those cards onto the battlefield and the rest on the bottom of your library in a random order.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "you", filter: { subtype: "Zombie" }, count: "x" },
      {
        kind: "reveal-until-count",
        filter: { type: "creature", subtype: "Zombie" },
        count: { thisWay: "sacrificed" },
        rest: "bottom-random",
      },
    ],
  },
});
