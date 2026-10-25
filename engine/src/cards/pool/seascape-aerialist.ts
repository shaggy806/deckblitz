import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// Zendikar (ZEN). EDHREC rank 15433. Akoum Battlesinger's shape; the grant
// reaches the Allies you control as it resolves (the ruling).

const TEXT =
  "Whenever this creature or another Ally you control enters, you may have Ally creatures you control gain flying until end of turn.";

export default defineCard({
  name: "Seascape Aerialist",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard", "Ally"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Ally creatures you control gain flying until end of turn?",
        effect: {
          kind: "grant-keyword-all",
          filter: { type: "creature", subtype: "Ally", controlledBy: "you" },
          keyword: "flying",
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
