import { defineCard } from "../define.js";


export default defineCard({
  name: "Leovold, Emissary of Trest",
  manaCost: "{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Advisor"],
  power: 3,
  toughness: 3,
  text: "Each opponent can't draw more than one card each turn.\nWhenever you or a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", player: "you", byOpponentOnly: true },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever you or a permanent you control becomes the target of a spell or ability an opponent controls, you may draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      prohibits: [{ act: "draw", who: "opponents", perTurn: 1 }],
      text: "Each opponent can't draw more than one card each turn.",
    },
  ],
});
