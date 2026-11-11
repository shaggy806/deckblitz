import { defineCard } from "../define.js";

// Tales of Middle-earth Commander. The dying creature is exiled with Shelob
// (rule 607.2a), which both abilities read: the first puts one of those
// cards into its owner's graveyard as a cost (`putFromExile`'s `linked`
// form, chosen as the cost is paid), the second targets one whose mana
// value is the X paid. A card that leaves exile is a new object (400.7),
// no longer one exiled with her (the Leyline of the Void ruling).
const DIES = "Whenever a nontoken creature an opponent controls dies, exile it.";
const FEED =
  "{2}{B}, Put a creature card exiled with Shelob into its owner's graveyard: Put two +1/+1 counters on Shelob. Draw a card.";
const RAISE =
  "{X}{1}{B}: Put target creature card with mana value X exiled with Shelob onto the battlefield tapped under your control.";

export default defineCard({
  name: "Shelob, Dread Weaver",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Demon"],
  power: 3,
  toughness: 3,
  text: `${DIES}\n${FEED}\n${RAISE}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", token: false, controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "exile", target: "trigger-object", linked: true },
      resolve: null,
      text: DIES,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false, putFromExile: { count: 1, linked: true, filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: FEED,
    },
    {
      cost: { mana: "{X}{1}{B}", tap: false },
      targets: [
        { kind: "card-in-exile", linked: true, filter: { type: "creature", manaValue: { op: "eq", n: "x" } } },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true, enterTapped: true },
      resolve: null,
      text: RAISE,
    },
  ],
});
