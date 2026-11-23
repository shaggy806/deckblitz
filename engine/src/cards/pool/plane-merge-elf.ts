import { defineCard } from "../define.js";

const LANDSHIP_TEXT =
  "Landship — At the beginning of your upkeep, you may look at the top card of your library. If it's a land, you may reveal it. If you do, create a 1/1 green Elf Warrior creature token.";
const KINFALL_TEXT =
  "Kinfall — Whenever a creature enters the battlefield under your control, if it shares a creature type with Plane-Merge Elf, creatures you control get +1/+1 until end of turn.";

export default defineCard({
  name: "Plane-Merge Elf",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${LANDSHIP_TEXT}\n${KINFALL_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "library-top",
        leftover: "stay",
        then: { kind: "create-token", token: "Elf Warrior Token", count: 1 },
      },
      resolve: null,
      text: LANDSHIP_TEXT,
    },
    {
      // "A creature" includes Plane-Merge Elf itself, which shares its types
      // with itself (`sharesCreatureTypeWith` holds for the reference object).
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", sharesCreatureTypeWith: "source" },
      },
      condition: { kind: "trigger-object", filter: { type: "creature", sharesCreatureTypeWith: "source" } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: KINFALL_TEXT,
    },
  ],
});
