import { defineCard } from "../define.js";

// Star Trek Commander (TRC). X is Julian Bashir's power as the target is
// chosen and again as the ability resolves (Guardian Scalelord's shape).

const SEEK_TEXT = "Seek out — Whenever you draw your second card each turn, put a +1/+1 counter on Julian Bashir.";
const ATTACK_TEXT =
  "Whenever Julian Bashir attacks, return target creature card with mana value X or less from your graveyard to the battlefield, where X is Julian Bashir's power.";

export default defineCard({
  name: "Julian Bashir, Frontier Doctor",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 1,
  toughness: 1,
  text: `${SEEK_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: SEEK_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { type: "creature", manaValue: { op: "lte", n: { amount: { powerOf: "source" } } } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
