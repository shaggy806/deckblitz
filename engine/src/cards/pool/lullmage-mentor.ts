import { defineCard } from "../define.js";

const TOKEN = "Whenever a spell or ability you control counters a spell, you may create a 1/1 blue Merfolk creature token.";
const COUNTER = "Tap seven untapped Merfolk you control: Counter target spell.";

export default defineCard({
  name: "Lullmage Mentor",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${TOKEN}\n${COUNTER}`,
  triggered: [
    {
      trigger: { on: "counters-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 1/1 blue Merfolk creature token?",
        effect: { kind: "create-token", token: "Merfolk Token", count: 1 },
      },
      resolve: null,
      text: TOKEN,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, tapOthers: { count: 7, filter: { subtype: "Merfolk", controlledBy: "you" }, includeSelf: true } },
      targets: ["spell"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: COUNTER,
    },
  ],
});
