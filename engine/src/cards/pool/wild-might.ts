import { defineCard } from "../define.js";

// EDHREC rank 29243. The +1/+1 always; the additional +4/+4 behind a rhystic
// `unless` (`chooser: "any-player"`).

export default defineCard({
  name: "Wild Might",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +1/+1 until end of turn. That creature gets an additional +4/+4 until end of turn unless any player pays {2}.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      {
        kind: "unless",
        chooser: "any-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      },
    ],
  },
});
