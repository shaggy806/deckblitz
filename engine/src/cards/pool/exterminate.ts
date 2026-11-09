import { defineCard } from "../define.js";

const TAP = "Tap an untapped Dalek you control";

export default defineCard({
  name: "Exterminate!",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  replicate: { cost: "", also: { text: TAP, tapUntapped: { filter: { subtype: "Dalek" }, count: 1 } } },
  text:
    "Replicate\u2014Tap an untapped Dalek you control. (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nDestroy target creature. Its controller loses 3 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "lose-life", amount: 3, toControllerOfTarget: 0 },
    ],
  },
});
