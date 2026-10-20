import { defineCard } from "../define.js";

// EDHREC rank 13827. Plunder the Trollshaws' shape: the spell asks where it
// was cast from as it resolves.

export default defineCard({
  name: "Secrets of the Key",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{3}{U}" },
  text: "Investigate. If this spell was cast from a graveyard, investigate twice instead. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")\nFlashback {3}{U}",
  targets: [],
  effect: {
    kind: "conditional",
    condition: { kind: "source", filter: { castFrom: "graveyard" } },
    then: { kind: "create-token", token: "Clue Token", count: 2 },
    else: { kind: "create-token", token: "Clue Token", count: 1 },
  },
});
