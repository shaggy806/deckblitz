import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 13170.
//
// Rulings:
//   [2023-04-14] If a backup ability targets the creature with backup, that creature will get
//     +1/+1 counters, but it won't gain additional abilities.
//   [2023-04-14] If a permanent enters the battlefield as a copy of a card with a backup ability
//     or a token is created that is a copy of that card, the order of the printed abilities is
//     maintained.
//   [2023-04-14] If a backup ability causes another creature to gain abilities, the creature with
//     backup will still have those abilities.
//   [2023-04-14] Backup confers only abilities that are actually printed below it. Any abilities
//     that are gained by the permanent are ignored, including abilities gained due to a resolving
//     spell or ability or copy effects.
//   [2023-04-14] The abilities that backup grants to the target creature are determined only once,
//     at the time the ability triggers. They won't change if the permanent with backup loses any
//     abilities before the backup ability resolves.

export default defineCard({
  name: "Death-Greeter's Champion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  keywords: ["double-strike"],
  dash: { cost: "{3}{R}" },
  text: "Dash {3}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)\nBackup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\nDouble strike",
  triggered: [backup(1, { keywords: ["double-strike"] })],
});
