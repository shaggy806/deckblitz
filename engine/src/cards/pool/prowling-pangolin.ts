import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 30600.
//
// As Argothian Wurm: each player is asked in turn from the active player,
// knowing who sacrificed before them; the option is offered only to a player
// with two creatures (rule 118.3). If any did, the Pangolin that entered is
// sacrificed — once (rule 400.7).

const TEXT =
  "When this creature enters, any player may sacrifice two creatures of their choice. If a player does, sacrifice this creature.";

export default defineCard({
  name: "Prowling Pangolin",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Pangolin", "Beast"],
  power: 6,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [
          { sacrifice: { type: "creature", controlledBy: "you" }, count: 2, text: "Sacrifice two creatures" },
        ],
        ifDid: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
