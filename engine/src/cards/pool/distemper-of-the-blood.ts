import { defineCard } from "../define.js";

// EDHREC rank 16085.

export default defineCard({
  name: "Distemper of the Blood",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  madness: { cost: "{R}" },
  text: "Target creature gets +2/+2 and gains trample until end of turn.\nMadness {R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
    ],
  },
});
