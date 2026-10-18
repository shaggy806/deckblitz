import { defineCard } from "../define.js";

// EDHREC rank 15888.
// Makes "X/X Golem Token (Haste)" — X read as the ability resolves, from the charge
// counters the Factory had as it was sacrificed (its last-known information).

const MANA_TEXT = "{T}: Add {R}. Put a charge counter on this artifact.";
const GOLEM_TEXT =
  "{2}{R}, {T}, Sacrifice this artifact: Create an X/X colorless Golem artifact creature token with haste, where X is the number of charge counters on Vulshok Factory. Activate only as a sorcery.";

export default defineCard({
  name: "Vulshok Factory",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${GOLEM_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}{R}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "X/X Golem Token (Haste)",
        count: 1,
        basePt: {
          power: { countersOn: "source", counter: "charge" },
          toughness: { countersOn: "source", counter: "charge" },
        },
      },
      resolve: null,
      text: GOLEM_TEXT,
      sorcerySpeed: true,
    },
  ],
});
