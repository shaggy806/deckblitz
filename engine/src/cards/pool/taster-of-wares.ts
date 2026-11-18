import { defineCard } from "../define.js";

// Rulings:
//   You pay all costs and follow all timing rules for cards cast this way. For example, if the
//   exiled card is a sorcery card, you may cast it only during your main phase while the stack is
//   empty.
//   The value of X is calculated only once, as Taster of Wares's ability resolves.
//
// Thieving Sprite's reveal (the opponent picks which X to show, you choose one of them), the
// chosen card exiled rather than discarded, with a permission over it that only an instant or
// sorcery card meets (`mayPlay`'s `filter`).

const ENTER_TEXT =
  "When this creature enters, target opponent reveals X cards from their hand, where X is the number of Goblins you control. You choose one of those cards. That player exiles it. If an instant or sorcery card is exiled this way, you may cast it for as long as you control this creature, and mana of any type can be spent to cast that spell.";

export default defineCard({
  name: "Taster of Wares",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 3,
  toughness: 2,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        reveals: { countOf: { subtype: "Goblin", controlledBy: "you" } },
        destination: "exile",
        mayPlay: {
          duration: "while-you-control-source",
          filter: { typesAnyOf: ["instant", "sorcery"] },
          spendAs: "any-type",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
