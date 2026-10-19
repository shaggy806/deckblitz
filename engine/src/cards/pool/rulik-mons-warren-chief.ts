import { defineCard } from "../define.js";

// Dominaria United (DMU). EDHREC rank 13507.
//
// Mobile Homestead's look at the top card, then Hakbal of the Surging Soul's
// "if you don't": the Goblin comes whenever no card was put onto the
// battlefield this way — the top card wasn't a land, or it was and you chose
// to leave it (the ruling). The land isn't played, so it takes no land drop.
const TEXT =
  "Whenever Rulik Mons attacks, look at the top card of your library. If it's a land card, you may put it onto the battlefield tapped. If you didn't put a card onto the battlefield this way, create a 1/1 red Goblin creature token.";

export default defineCard({
  name: "Rulik Mons, Warren Chief",
  manaCost: "{1}{R}{G}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 1,
            min: 0,
            max: 1,
            filter: { type: "land" },
            destination: "battlefield",
            enterTapped: true,
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", atMost: 0 },
            then: { kind: "create-token", token: "Goblin Token", count: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
