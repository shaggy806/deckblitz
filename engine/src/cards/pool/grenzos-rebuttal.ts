import { defineCard } from "../define.js";

// EDHREC rank 28175.
//
// The Ogre first, so the player to your right may choose it (the ruling).
// Then, in turn order starting with you (the ruling; `startingWithYou`), each
// player chooses an artifact, a creature and a land from among the
// permanents of the player to their left — `choose-one-of-each` with
// `anyController`, its filter read from the chooser's side
// (`controlledBy: "player-to-your-left"`). No targets, so protection doesn't
// stop it; an artifact creature may stand for either slot or both (the
// rulings). Every permanent chosen is destroyed at once (the ruling).

const TEXT =
  "Create a 4/4 red Ogre creature token. Starting with you, each player chooses an artifact, a creature, and a land from among the permanents controlled by the player to their left. Destroy each permanent chosen this way.";

export default defineCard({
  name: "Grenzo's Rebuttal",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "4/4 Red Ogre Token", count: 1 },
      {
        kind: "choose-one-of-each",
        who: "each-player",
        startingWithYou: true,
        slots: ["artifact", "creature", "land"],
        filter: { controlledBy: "player-to-your-left" },
        anyController: true,
        chosen: "destroy",
        prompt: "Choose an artifact, a creature, and a land of the player to your left's to destroy",
      },
    ],
  },
});
