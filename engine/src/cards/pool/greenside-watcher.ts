import { defineCard } from "../define.js";

// EDHREC rank 16387.
//
// Rulings:
//   [2013-01-24] Greenside Watcher’s ability is not a mana ability. It uses the stack and can be
//     responded to.

export default defineCard({
  name: "Greenside Watcher",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 1,
  text: "{T}: Untap target Gate.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Gate" } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "{T}: Untap target Gate.",
    },
  ],
});
