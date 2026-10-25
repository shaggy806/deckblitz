import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 12550.

const TEXT =
  "Whenever this creature or another Ally you control enters, you may create a 2/2 green Wolf creature token. If you do, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Turntimber Ranger",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout", "Ranger", "Ally"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create a 2/2 green Wolf creature token and put a +1/+1 counter on Turntimber Ranger?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Wolf Token", count: 1 },
            { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
