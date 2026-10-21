import { defineCard } from "../define.js";

// EDHREC rank 20220.
//
// Rulings:
//   You can activate one loyalty ability of each planeswalker you control during each of your
//     turns, whether that ability is one it always has or the one it gains because of Vivien's
//     Talent.
//
// Way of the Wildspeaker's granted loyalty ability, on the enchanted
// planeswalker only; Vivien Reid's +1 as the ability.

const GRANTED =
  "+1: Look at the top four cards of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const DRAWN = "Whenever a nontoken creature you control enters, put a loyalty counter on enchanted planeswalker.";

export default defineCard({
  name: "Vivien's Talent",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant planeswalker\nEnchanted planeswalker has "[+1]: Look at the top four cards of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order."\n${DRAWN}`,
  targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature", token: false } },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "loyalty", amount: 1 },
      resolve: null,
      text: DRAWN,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          loyaltyCost: 1,
          cost: { tap: false, mana: null },
          targets: [],
          effect: {
            kind: "look-and-choose",
            zone: "library",
            count: 4,
            reveal: "chosen",
            min: 0,
            max: 1,
            filter: { typesAnyOf: ["creature", "land"] },
            destination: "hand",
            leftover: "bottom-random",
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: 'Enchanted planeswalker has "[+1]: Look at the top four cards of your library. You may reveal a creature or land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order."',
    },
  ],
});
