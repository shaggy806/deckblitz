import { defineCard } from "../define.js";

// Edge of Eternities (EOE).
//
// "Has no abilities" applies as the card enters (rule 614.12, the ruling): its
// enters triggers don't trigger, it doesn't enter tapped or as a copy, and an
// ability it gains afterwards it keeps (`enterAs.loseAbilities`).

const TEXT =
  "{T}: Return target creature card from your graveyard to the battlefield. It's a Skeleton in addition to its other types and has no abilities. Activate only as a sorcery.";

export default defineCard({
  name: "Xu-Ifit, Osteoharmonist",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        enterAs: { addSubtypes: ["Skeleton"], loseAbilities: true },
      },
      sorcerySpeed: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
