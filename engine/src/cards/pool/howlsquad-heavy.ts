import { defineCard } from "../define.js";
import { maxSpeed } from "../helpers.js";

// EDHREC rank 3028. Legion Warboss's token, which attacks this combat if
// able (rule 508.1d) and, a Goblin, has haste from this. The max speed
// ability is a mana ability: it can't be responded to (the ruling), and it
// counts Goblins as it resolves, this one included.
const HASTE_TEXT = "Other Goblins you control have haste.";
const TOKEN_TEXT =
  "At the beginning of combat on your turn, create a 1/1 red Goblin creature token. That token attacks this combat if able.";
const MANA_TEXT = "{T}: Add {R} for each Goblin you control.";

export default defineCard({
  name: "Howlsquad Heavy",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Mercenary"],
  power: 2,
  toughness: 3,
  keywords: ["start-your-engines"],
  text: `Start your engines!\n${HASTE_TEXT}\n${TOKEN_TEXT}\nMax speed — ${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 1, attacksThisCombat: true },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Goblin" },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
    maxSpeed({
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: { kind: "add-mana", mana: "R", amount: { countOf: { subtype: "Goblin", controlledBy: "you" } } },
          resolve: null,
          text: MANA_TEXT,
        },
      ],
      text: `Max speed — ${MANA_TEXT}`,
    }),
  ],
});
