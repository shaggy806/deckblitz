import { defineCard } from "../define.js";

// Rulings: the token copies the printed card (its as-enters abilities work);
// the Nightmare type is copiable; every other Nightmare token you control is
// exiled, not just ones it made.

const TEXT =
  "{T}: Exile target creature card from a graveyard that was put there this turn. Create a token that's a copy of it, except it's a Nightmare in addition to its other types. Then exile all other Nightmare tokens you control.";

export default defineCard({
  name: "Abyssal Harvester",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Warlock"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature", putIntoGraveyardThisTurn: {} } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "create-token-copy",
            of: 0,
            count: 1,
            who: "you",
            asCard: true,
            exceptions: { addSubtypes: ["Nightmare"] },
          },
          {
            kind: "exile-all",
            filter: { token: true, subtype: "Nightmare", controlledBy: "you", notThisWay: "created" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
