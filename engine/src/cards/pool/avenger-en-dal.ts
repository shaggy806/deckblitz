import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 25046.
//
// Swords to Plowshares' shape: the life is read from the exiled creature as
// it last existed on the battlefield (rule 608.2h).

const TEXT =
  "{2}{W}, {T}, Discard a card: Exile target attacking creature. Its controller gains life equal to its toughness.";

export default defineCard({
  name: "Avenger en-Dal",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true, discard: { count: 1 } },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "gain-life", amount: { toughnessOf: 0 }, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
