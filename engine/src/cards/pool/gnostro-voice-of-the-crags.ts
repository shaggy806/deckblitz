import { defineCard } from "../define.js";

// Commander Legends (CMR). EDHREC rank 23293.
//
// The mode is chosen as it's activated (rule 700.2b); X is read as the
// ability resolves (the ruling).
const X = { turnStat: "spells-cast" } as const;

export default defineCard({
  name: "Gnostro, Voice of the Crags",
  manaCost: "{1}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Chimera"],
  power: 3,
  toughness: 3,
  text: "{T}: Choose one. X is the number of spells you've cast this turn.\n• Scry X.\n• Gnostro deals X damage to target creature.\n• You gain X life.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Scry X.", effect: { kind: "scry", amount: X } },
          {
            text: "Gnostro deals X damage to target creature.",
            targets: ["creature"],
            effect: { kind: "damage", amount: X, target: 0 },
          },
          { text: "You gain X life.", effect: { kind: "gain-life", amount: X } },
        ],
      },
      resolve: null,
      text: "{T}: Choose one. X is the number of spells you've cast this turn.\n• Scry X.\n• Gnostro deals X damage to target creature.\n• You gain X life.",
    },
  ],
});
