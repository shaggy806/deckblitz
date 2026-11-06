import { defineCard } from "../define.js";

// Star Trek Commander (TRC). "If you control a commander as you cast this
// spell" is read as it's cast (`maxModesIf`, Drown in Dreams' shape); each
// count is the attacking creatures as the spell resolves.

const MODE_1 = "Create a 1/1 colorless Borg artifact creature token for each attacking creature.";
const MODE_2 = "Draw a card for each attacking creature.";
const ATTACKERS = { countOf: { type: "creature", attacking: true } } as const;

export default defineCard({
  name: "Collective Override",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: `Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• ${MODE_1}\n• ${MODE_2}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: { condition: { kind: "controls", filter: { isCommander: true }, atLeast: 1 }, maxModes: 2 },
    modes: [
      {
        text: MODE_1,
        targets: [],
        effect: { kind: "create-token", token: "Borg Token", count: ATTACKERS },
      },
      {
        text: MODE_2,
        targets: [],
        effect: { kind: "draw", amount: ATTACKERS },
      },
    ],
  },
});
