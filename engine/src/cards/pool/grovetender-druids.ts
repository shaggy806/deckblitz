import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 26278.
//
// Rally (`thisOrAnother`): each trigger offers its own {1}.
const TEXT =
  "Rally — Whenever this creature or another Ally you control enters, you may pay {1}. If you do, create a 1/1 green Plant creature token.";

export default defineCard({
  name: "Grovetender Druids",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid", "Ally"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to create a 1/1 green Plant creature token?",
        cost: "{1}",
        effect: { kind: "create-token", token: "1/1 Green Plant Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
