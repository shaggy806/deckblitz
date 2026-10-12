import { defineCard } from "../define.js";

// EDHREC rank 17680. Marvel Super Heroes Commander.
//
// Chandra, Acolyte of Flame's −2 on an attack trigger, its mana-value cap
// Alesha's: his power as the target is chosen and again as it resolves (rule
// 608.2b). The spell is cast by paying its costs. "If you cast a spell this
// way" is `cast-now`'s `then`.
const ATTACK_TEXT =
  "Whenever Helmut Zemo attacks, you may cast target instant or sorcery card with mana value less than or equal to his power from your graveyard. If that spell would be put into your graveyard, exile it instead. If you cast a spell this way, put a +1/+1 counter on Helmut Zemo.";

export default defineCard({
  name: "Helmut Zemo, Mastermind",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Villain"],
  power: 2,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["instant", "sorcery"],
            manaValue: { op: "lte", n: { amount: { powerOf: "source" } } },
          },
        },
      ],
      effect: {
        kind: "cast-now",
        target: 0,
        exileAfter: true,
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
