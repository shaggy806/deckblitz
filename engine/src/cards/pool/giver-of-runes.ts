import { defineCard } from "../define.js";

// EDHREC rank 1385.
//
// "Colorless or the color of your choice" is one choice as the ability
// resolves: colorless (a filter, since colorless isn't a colour) or one of the
// five.
const TEXT =
  "{T}: Another target creature you control gains protection from colorless or from the color of your choice until end of turn.";

export default defineCard({
  name: "Giver of Runes",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color", or: [{ text: "colorless", from: { filter: { colorless: true } } }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
