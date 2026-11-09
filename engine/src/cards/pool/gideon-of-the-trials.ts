import { defineCard } from "../define.js";

const PLUS = "+1: Until your next turn, prevent all damage target permanent would deal.";
const ZERO =
  "0: Until end of turn, Gideon becomes a 4/4 Human Soldier creature with indestructible that's still a planeswalker. Prevent all damage that would be dealt to him this turn.";
const EMBLEM = "As long as you control a Gideon planeswalker, you can't lose the game and your opponents can't win the game.";
const ULT = `0: You get an emblem with "${EMBLEM}"`;

export default defineCard({
  name: "Gideon of the Trials",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Gideon"],
  loyalty: 3,
  text: `${PLUS}\n${ZERO}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["permanent"],
      effect: { kind: "damage-rule", by: { target: 0 }, duration: "until-your-next-turn" },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "become",
            target: "source",
            power: 4,
            toughness: 4,
            addTypes: ["creature"],
            addSubtypes: ["Human", "Soldier"],
            keywords: ["indestructible"],
            duration: "end-of-turn",
          },
          { kind: "prevent-damage", target: "source", amount: "all" },
        ],
      },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM,
        static: {
          affects: { scope: "self" },
          condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Gideon" }, atLeast: 1 },
          text: EMBLEM,
          prohibits: [{ act: "lose-game", who: "you" }, { act: "win-game", who: "opponents" }],
        },
      },
      resolve: null,
      text: ULT,
    },
  ],
});
