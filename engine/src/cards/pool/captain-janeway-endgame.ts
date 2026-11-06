import { defineCard } from "../define.js";

const DAMAGE_TEXT =
  "Whenever one or more Officers you control deal combat damage to a player, you draw a card and create a 1/1 red Officer creature token.";
const EVADE_TEXT = "{2}, Tap an untapped creature you control: Captain Janeway can't be blocked this turn.";

export default defineCard({
  name: "Captain Janeway, Endgame",
  manaCost: "{1}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 3,
  text: `${DAMAGE_TEXT}\n${EVADE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtype: "Officer" }, combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "create-token", token: "Officer Token", count: 1 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" }, includeSelf: true },
      },
      targets: [],
      effect: { kind: "restrict", target: "source", restrictions: ["cant-be-blocked"] },
      resolve: null,
      text: EVADE_TEXT,
    },
  ],
});
