import { defineCard } from "../define.js";

const IMPRINT_TEXT = "Imprint — When this creature enters, exile target land.";
const WATCH_TEXT =
  "Whenever a land an opponent controls with the same name as the exiled card enters, this creature deals 2 damage to that player.";

// The exile is linked to this permanent (rule 607.2a), and the trigger's filter
// reads the linked card live.
export default defineCard({
  name: "Invader Parasite",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 3,
  toughness: 2,
  text: `${IMPRINT_TEXT}\n${WATCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: IMPRINT_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "any",
        filter: { type: "land", controlledBy: "opponent", sameNameWith: "exiled-with-source" },
      },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: WATCH_TEXT,
    },
  ],
});
