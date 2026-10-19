import { defineCard } from "../define.js";

const ETB_TEXT =
  "Domain — When Bortuk Bonerattle enters, if you cast it, choose target creature card in your graveyard. Return that card to the battlefield if its mana value is less than or equal to the number of basic land types among lands you control. Otherwise, put it into your hand.";

export default defineCard({
  name: "Bortuk Bonerattle",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Troll", "Shaman"],
  power: 4,
  toughness: 4,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // "If you cast it", from any zone — an intervening-if (Iridescent Tiger).
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: { manaValue: { op: "lte", n: { amount: { basicLandTypes: "you" } } } },
        },
        then: { kind: "put-onto-battlefield", target: 0 },
        else: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
