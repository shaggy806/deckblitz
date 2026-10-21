import { defineCard } from "../define.js";

// EDHREC rank 15550. The +2 and the −10 reach only the creatures you control
// as each resolves (its ruling — matches fixed at resolution, rule 611.2c);
// the granted trigger fires on any damage to an opponent, combat or not.

const ULT_TEXT =
  "−10: Until end of turn, creatures you control gain deathtouch and \"Whenever this creature deals damage to an opponent, that player loses the game.\"";

export default defineCard({
  name: "Vraska, Scheming Gorgon",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vraska"],
  loyalty: 5,
  text: `+2: Creatures you control get +1/+0 until end of turn.\n−3: Destroy target creature.\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "+2: Creatures you control get +1/+0 until end of turn.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "−3: Destroy target creature.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "deathtouch",
            duration: "end-of-turn",
          },
          {
            kind: "grant-triggered-all",
            filter: { type: "creature", controlledBy: "you" },
            duration: "end-of-turn",
            ability: {
              trigger: { on: "deals-damage", who: "self", to: "opponent" },
              targets: [],
              effect: { kind: "lose-game", who: "trigger-player" },
              resolve: null,
              text: "Whenever this creature deals damage to an opponent, that player loses the game.",
            },
          },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
