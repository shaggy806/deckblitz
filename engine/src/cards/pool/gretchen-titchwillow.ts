import { defineCard } from "../define.js";

// EDHREC rank 8710.
//
// Growth Spiral's shape. Putting the land onto the battlefield isn't playing
// it, so it's allowed past the land drop and on any turn (the ruling).

export default defineCard({
  name: "Gretchen Titchwillow",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Druid"],
  power: 0,
  toughness: 4,
  text: "{2}{G}{U}: Draw a card. You may put a land card from your hand onto the battlefield.",
  activated: [
    {
      cost: { mana: "{2}{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: { type: "land" },
          },
        ],
      },
      resolve: null,
      text: "{2}{G}{U}: Draw a card. You may put a land card from your hand onto the battlefield.",
    },
  ],
});
