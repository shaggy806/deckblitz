import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of each player's upkeep, that player untaps Karona and gains control of it.";
const ATTACK_TEXT =
  "Whenever Karona attacks, creatures of the creature type of your choice get +3/+3 until end of turn.";

export default defineCard({
  name: "Karona, False God",
  manaCost: "{1}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 5,
  toughness: 5,
  keywords: ["haste"],
  text: `Haste\n${UPKEEP_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      // "That player" is the one whose upkeep it is (as Alexios, Deimos of
      // Kosmos): they untap it and gain control of it.
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source", by: "active-player" },
          { kind: "gain-control", target: "source", who: "active-player", untilEndOfTurn: false },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      // "Your choice": the attacking controller's, as the trigger resolves;
      // every creature of that type, whoever controls it.
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "modify-pt-all",
          filter: { type: "creature", subtype: "$chosen" },
          power: 3,
          toughness: 3,
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
