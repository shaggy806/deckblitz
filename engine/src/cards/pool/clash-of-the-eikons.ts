import { defineCard } from "../define.js";

// EDHREC rank 6170. The modes are chosen as it's cast and followed in printed
// order, so removing then putting a lore counter on the same Saga triggers
// that chapter again (rule 714.2c).

const SAGA_YOU_CONTROL = { kind: "permanent", whose: "you", filter: { subtype: "Saga" } } as const;

export default defineCard({
  name: "Clash of the Eikons",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Choose one or more —\n• Target creature you control fights target creature an opponent controls.\n• Remove a lore counter from target Saga you control. (Removing lore counters doesn't cause chapter abilities to trigger.)\n• Put a lore counter on target Saga you control.",
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 3,
    modes: [
      {
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1 },
        text: "Target creature you control fights target creature an opponent controls.",
      },
      {
        targets: [SAGA_YOU_CONTROL],
        effect: { kind: "remove-counter", target: 0, counter: "lore", amount: 1 },
        text: "Remove a lore counter from target Saga you control.",
      },
      {
        targets: [SAGA_YOU_CONTROL],
        effect: { kind: "add-counter", target: 0, counter: "lore", amount: 1 },
        text: "Put a lore counter on target Saga you control.",
      },
    ],
  },
});
