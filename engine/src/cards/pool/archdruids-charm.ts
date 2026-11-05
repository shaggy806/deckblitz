import { defineCard } from "../define.js";

// EDHREC rank 622.
//
// Rulings:
//   [2023-04-14] You can't choose the second mode for Archdruid's Charm unless you and another
//     player have creatures to target.
//   [2023-04-14] If you choose the second mode and your creature is not a legal target as
//     Archdruid's Charm resolves, you won't put a +1/+1 counter on it, and no damage will be dealt.
//   [2023-04-14] If you choose the second mode and the creature you don't control is not a legal
//     target as Archdruid's Charm resolves, you'll still put a +1/+1 counter on your creature.
//
// The first mode's find goes where its card type says, no choice
// (`search-library`'s `instead` with `pick: "all"`); the second is Hunter's
// Edge's counter then one-sided fight.
export default defineCard({
  name: "Archdruid's Charm",
  manaCost: "{G}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose one —\n• Search your library for a creature or land card and reveal it. Put it onto the battlefield tapped if it's a land card. Otherwise, put it into your hand. Then shuffle.\n• Put a +1/+1 counter on target creature you control. It deals damage equal to its power to target creature you don't control.\n• Exile target artifact or enchantment.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Search your library for a creature or land card and reveal it. Put it onto the battlefield tapped if it's a land card. Otherwise, put it into your hand. Then shuffle.",
        effect: {
          kind: "search-library",
          filter: { typesAnyOf: ["creature", "land"] },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
          instead: { destination: "battlefield", enterTapped: true, filter: { type: "land" }, pick: "all" },
        },
      },
      {
        text: "Put a +1/+1 counter on target creature you control. It deals damage equal to its power to target creature you don't control.",
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            { kind: "fight", a: 0, b: 1, oneSided: true },
          ],
        },
      },
      {
        text: "Exile target artifact or enchantment.",
        targets: ["artifact-or-enchantment"],
        effect: { kind: "exile", target: 0 },
      },
    ],
  },
});
