import { defineCard } from "../define.js";

// "Target player investigates" is a Clue made under the target player's
// control (rule 701.36a; `who: "target-controller"` reads a player slot as
// that player — Emeritus of Truce's shape).

export default defineCard({
  name: "Panther Pounce",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player investigates. Target creature gets +1/+0 and gains flying until end of turn. Untap it. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  targets: ["player", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Clue Token", count: 1, who: "target-controller" },
      { kind: "modify-pt", target: 1, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 1, keyword: "flying", duration: "end-of-turn" },
      { kind: "untap", target: 1 },
    ],
  },
});
