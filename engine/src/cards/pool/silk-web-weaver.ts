import { defineCard } from "../define.js";

// EDHREC rank 7277.

const CAST_TEXT = "Whenever you cast a creature spell, create a 1/1 green and white Human Citizen creature token.";
const PUMP_TEXT = "{3}{G}{W}: Creatures you control get +2/+2 and gain vigilance until end of turn.";

export default defineCard({
  name: "Silk, Web Weaver",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Human", "Hero"],
  power: 3,
  toughness: 5,
  webSlinging: { cost: "{1}{G}{W}" },
  text: `Web-slinging {1}{G}{W} (You may cast this spell for {1}{G}{W} if you also return a tapped creature you control to its owner's hand.)\n${CAST_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Human Citizen Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}{W}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 2,
            toughness: 2,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "vigilance",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
