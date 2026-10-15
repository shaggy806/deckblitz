import { defineCard } from "../define.js";

// EDHREC rank 16671.
// Makes Kithkin → "Kithkin Token".
//
// Rulings: the copy is of the Kithkin's copiable values (a token of a token
// copies what made it; {X} is 0); with every target illegal it does nothing,
// with some it does what it can. "Target Kithkin you control" is any Kithkin
// permanent — a kindred one too. Ashling's Command's shape.
export default defineCard({
  name: "Brigid's Command",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["kindred", "sorcery"],
  subtypes: ["Kithkin"],
  text:
    "Choose two —\n" +
    "• Create a token that's a copy of target Kithkin you control.\n" +
    "• Target player creates a 1/1 green and white Kithkin creature token.\n" +
    "• Target creature you control gets +3/+3 until end of turn.\n" +
    "• Target creature you control fights target creature an opponent controls.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Create a token that's a copy of target Kithkin you control.",
        targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Kithkin" } }],
        effect: { kind: "create-token-copy", of: 0, count: 1 },
      },
      {
        text: "Target player creates a 1/1 green and white Kithkin creature token.",
        targets: ["player"],
        effect: { kind: "create-token", token: "Kithkin Token", count: 1, who: "target-controller" },
      },
      {
        text: "Target creature you control gets +3/+3 until end of turn.",
        targets: ["creature-you-control"],
        effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      },
      {
        text: "Target creature you control fights target creature an opponent controls.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1 },
      },
    ],
  },
});
