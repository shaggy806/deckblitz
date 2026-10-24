import { defineCard } from "../define.js";

// EDHREC rank 13049.
//
// Putting the land onto the battlefield isn't playing it (the ruling): no
// land drop is used.

export default defineCard({
  name: "Swell of Growth",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. You may put a land card from your hand onto the battlefield.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "land" },
      },
    ],
  },
});
