import { defineCard } from "../define.js";

// EDHREC rank 14644. Front face. Its ruling: the target's mana value is exactly
// the damage those tokens dealt that player (the batch's trigger value). The
// copy is cast as this resolves or not at all; "if you do" is `cast-now`'s
// `then`.

const DAMAGE_TEXT =
  "Whenever one or more creature tokens you control deal combat damage to a player, exile target instant or sorcery card with mana value equal to the damage dealt from their graveyard. Copy it. You may cast the copy without paying its mana cost. If you do, convert Soundwave.";

export default defineCard({
  name: "Soundwave, Sonic Spy",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 5,
  toughness: 4,
  text: `More Than Meets the Eye {2}{W}{U}{B} (You may cast this card converted for {2}{W}{U}{B}.)\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { type: "creature", token: true },
        combat: true,
      },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "trigger-player",
          filter: {
            typesAnyOf: ["instant", "sorcery"],
            manaValue: { op: "eq", n: { amount: { triggerValue: true } } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "cast-now",
            from: "exiled-this-way",
            copies: 1,
            free: true,
            then: { kind: "transform", target: "source" },
          },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  faces: ["Soundwave, Sonic Spy", "Soundwave, Superior Captain"],
  transform: true,
  moreThanMeetsTheEye: { cost: "{2}{W}{U}{B}" },
});
