import { defineCard } from "../define.js";

// EDHREC rank 10810. Rivals of Ixalan.
//
// Ascend on an instant is its first instruction as it resolves (rule
// 702.131a), so the blessing it gives counts for its own "if". With the
// blessing, its controller may put the permanent on top of its owner's
// library; declining returns it to its owner's hand (the ruling).

export default defineCard({
  name: "Expel from Orazca",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  keywords: ["ascend"],
  text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nReturn target nonland permanent to its owner's hand. If you have the city's blessing, you may put that permanent on top of its owner's library instead.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "conditional",
    condition: { kind: "citys-blessing" },
    then: {
      kind: "may",
      prompt: "Put that permanent on top of its owner's library instead?",
      effect: { kind: "put-on-library", target: 0, position: "top" },
      else: { kind: "return-to-hand", target: 0 },
    },
    else: { kind: "return-to-hand", target: 0 },
  },
});
