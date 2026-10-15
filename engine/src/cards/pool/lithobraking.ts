import { defineCard } from "../define.js";

// EDHREC rank 15359.
//
// "Then you may sacrifice an artifact. When you do, …" is General Traag's
// shape: the sacrifice is a choice as it resolves (the Lander just made
// among the artifacts), and the damage a reflexive trigger (rule 603.12).

const TEXT =
  'Create a Lander token. Then you may sacrifice an artifact. When you do, Lithobraking deals 2 damage to each creature. (A Lander token is an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")';

export default defineCard({
  name: "Lithobraking",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Lander Token", count: 1 },
      {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "damage-all", filter: { type: "creature" }, amount: 2 },
          text: "When you do, Lithobraking deals 2 damage to each creature.",
        },
      },
    ],
  },
});
