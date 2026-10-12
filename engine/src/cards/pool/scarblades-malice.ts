import { defineCard } from "../define.js";

// EDHREC rank 11097.

export default defineCard({
  name: "Scarblade's Malice",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature you control gains deathtouch and lifelink until end of turn. When that creature dies this turn, create a 2/2 black and green Elf creature token.",
  targets: ["creature-you-control"],
  // The death watch is Kelsien's / Together Forever's delayed trigger on the
  // target, this turn only; the token is the spell's controller's.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "create-token", token: "2/2 Black Green Elf Token", count: 1 },
        text: "When that creature dies this turn, create a 2/2 black and green Elf creature token.",
      },
    ],
  },
});
