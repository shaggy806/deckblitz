import { defineCard } from "../define.js";

// EDHREC rank 21971. Turntimber Symbiosis's shape: the creature card is
// chosen and revealed where it lies (`destination: "stay"`, `reveal:
// "chosen"`), the rest go to the bottom, then the chosen card goes on. With
// mana value 2 or less its controller may put it onto the battlefield, and it
// gains haste; otherwise, or declined, it goes to the hand — `return-to-hand`
// `from: "library"` does nothing to a card that has already left the library.

const TEXT =
  "Look at the top six cards of your library. You may reveal a creature card from among them. If that card has mana value 2 or less, you may put it onto the battlefield and it gains haste until end of turn. If you didn't put the revealed card onto the battlefield this way, put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Break Out",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 6,
    reveal: "chosen",
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "stay",
    leftover: "bottom-random",
    then: {
      kind: "sequence",
      effects: [
        {
          kind: "conditional",
          condition: { kind: "target", index: 0, filter: { manaValue: { op: "lte", n: 2 } } },
          then: {
            kind: "may",
            prompt: "Put the revealed card onto the battlefield with haste?",
            aboutTarget: 0,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "put-onto-battlefield", target: 0 },
                {
                  kind: "grant-keyword-all",
                  filter: { thisWay: "put-onto-battlefield" },
                  keyword: "haste",
                  duration: "end-of-turn",
                },
              ],
            },
          },
        },
        { kind: "return-to-hand", target: 0, from: "library" },
      ],
    },
  },
});
