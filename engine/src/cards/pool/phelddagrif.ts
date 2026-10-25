import { defineCard } from "../define.js";

// EDHREC rank 15290.
//
// Rulings:
//   [2005-11-01] All three abilities are now targeted.

export default defineCard({
  name: "Phelddagrif",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phelddagrif"],
  power: 4,
  toughness: 4,
  text: "{G}: Phelddagrif gains trample until end of turn. Target opponent creates a 1/1 green Hippo creature token.\n{W}: Phelddagrif gains flying until end of turn. Target opponent gains 2 life.\n{U}: Return Phelddagrif to its owner's hand. Target opponent may draw a card.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          { kind: "create-token", token: "1/1 Green Hippo Token", count: 1, who: "target-controller" },
        ],
      },
      resolve: null,
      text: "{G}: Phelddagrif gains trample until end of turn. Target opponent creates a 1/1 green Hippo creature token.",
    },
    {
      cost: { mana: "{W}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "gain-life", amount: 2, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: "{W}: Phelddagrif gains flying until end of turn. Target opponent gains 2 life.",
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: "source" },
          {
            kind: "each-player-may",
            who: { controllerOfTarget: 0 },
            prompt: "Draw a card?",
            effect: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "{U}: Return Phelddagrif to its owner's hand. Target opponent may draw a card.",
    },
  ],
});
