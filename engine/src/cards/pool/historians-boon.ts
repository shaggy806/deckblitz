import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const ENTER_TEXT =
  "Whenever this enchantment or another nontoken enchantment you control enters, create a 1/1 white Soldier creature token.";
// As the final chapter ability triggers (rule 714.2e) — not as it resolves —
// so both wait together for the next time a player would receive priority,
// and their controller orders them (rule 603.3b).
const SAGA_TEXT =
  "Whenever the final chapter ability of a Saga you control triggers, create a 4/4 white Angel creature token with flying and vigilance.";

export default defineCard({
  name: "Historian's Boon",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${SAGA_TEXT}`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment", token: false } },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    }),
    {
      trigger: { on: "event", event: "final-chapter-triggers", who: "you-control" },
      targets: [],
      effect: { kind: "create-token", token: "4/4 Vigilant Angel Token", count: 1 },
      resolve: null,
      text: SAGA_TEXT,
    },
  ],
});
