import { defineCard } from "../define.js";

const ENTERS_TEXT =
  'When Moseo enters, create a 1/1 black and green Pest creature token with "Whenever this token attacks, you gain 1 life."';
const INFUSION_TEXT =
  "Infusion — At the beginning of your end step, if you gained life this turn, return up to one target creature card with mana value X or less from your graveyard to the battlefield, where X is the amount of life you gained this turn.";

export default defineCard({
  name: "Moseo, Vein's New Dean",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Skeleton", "Warlock"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}\n${INFUSION_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Pest Token (Attacks)", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: {
              type: "creature",
              manaValue: { op: "lte", n: { amount: { turnStat: "life-gained", who: "you" } } },
            },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: INFUSION_TEXT,
    },
  ],
});
