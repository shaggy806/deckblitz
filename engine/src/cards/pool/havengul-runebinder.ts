import { defineCard } from "../define.js";

// Dark Ascension (DKA). EDHREC rank 17440.
//
// Rulings:
//   [2011-01-22] The Zombie creature token you put onto the battlefield will also get a +1/+1
//     counter.

const TEXT =
  "{2}{U}, {T}, Exile a creature card from your graveyard: Create a 2/2 black Zombie creature token, then put a +1/+1 counter on each Zombie creature you control.";

export default defineCard({
  name: "Havengul Runebinder",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Zombie Token", count: 1 },
          {
            kind: "add-counter-all",
            filter: { type: "creature", subtype: "Zombie", controlledBy: "you" },
            counter: "+1/+1",
            amount: 1,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
