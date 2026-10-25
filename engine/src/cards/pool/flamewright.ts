import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 22867. It can't sacrifice itself to its own cost:
// it has no defender.

const MAKE_TEXT = "{1}, {T}: Create a 1/1 colorless Construct artifact creature token with defender.";
const PING_TEXT = "{T}, Sacrifice a creature with defender: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Flamewright",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: `${MAKE_TEXT}\n${PING_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Construct Token (Defender)", count: 1 },
      resolve: null,
      text: MAKE_TEXT,
    },
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "creature", keyword: "defender" } } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
