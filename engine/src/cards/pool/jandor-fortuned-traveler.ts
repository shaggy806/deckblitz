import { defineCard } from "../define.js";
import { saddle } from "../helpers.js";

const MOUNTS =
  "Each Beast, Camel, Horse, Elephant, and Wolf creature you control is a Mount in addition to its other types and has saddle 2. (Tap any number of other creatures you control with total power 2 or more: That Mount becomes saddled until end of turn. Saddle only as a sorcery.)";
const ATTACKS = "Whenever a saddled creature you control attacks, it gets +2/+2 until end of turn. Draw a card. Create a Food token.";

export default defineCard({
  name: "Jandor, Fortuned Traveler",
  manaCost: "{1}{R}{G}{W}",
  colors: ["R", "G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 4,
  text: `${MOUNTS}\n${ATTACKS}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: {
          type: "creature",
          controlledBy: "you",
          anyOf: [{ subtype: "Beast" }, { subtype: "Camel" }, { subtype: "Horse" }, { subtype: "Elephant" }, { subtype: "Wolf" }],
        },
      },
      addSubtypes: ["Mount"],
      grantsActivated: [saddle(2)],
      text: MOUNTS,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { saddled: true } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "trigger-object", power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "draw", amount: 1 },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
