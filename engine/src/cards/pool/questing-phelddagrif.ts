import { defineCard } from "../define.js";

// EDHREC rank 17423.
//
// Phelddagrif's shape: each ability targets the opponent who gets the gift.
export default defineCard({
  name: "Questing Phelddagrif",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  types: ["creature"],
  subtypes: ["Phelddagrif"],
  power: 4,
  toughness: 4,
  text: "{G}: This creature gets +1/+1 until end of turn. Target opponent creates a 1/1 green Hippo creature token.\n{W}: This creature gains protection from black and from red until end of turn. Target opponent gains 2 life.\n{U}: This creature gains flying until end of turn. Target opponent may draw a card.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "create-token", token: "1/1 Green Hippo Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: "{G}: This creature gets +1/+1 until end of turn. Target opponent creates a 1/1 green Hippo creature token.",
    },
    {
      cost: { mana: "{W}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-protection", target: "source", from: { colors: ["B", "R"] }, duration: "end-of-turn" },
          { kind: "gain-life", amount: 2, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: "{W}: This creature gains protection from black and from red until end of turn. Target opponent gains 2 life.",
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          {
            kind: "each-player-may",
            who: { controllerOfTarget: 0 },
            prompt: "Draw a card?",
            effect: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "{U}: This creature gains flying until end of turn. Target opponent may draw a card.",
    },
  ],
});
