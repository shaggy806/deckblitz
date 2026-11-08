import { defineCard } from "../define.js";

// EDHREC rank 4493. Commander 2017.
//
// Its controller and the copy's values are read as the permanent last existed
// on the battlefield, after the exile (rule 608.2h). The tokens are created at
// once, one instruction.
export default defineCard({
  name: "Fractured Identity",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Exile target nonland permanent. Each player other than its controller creates a token that's a copy of it.",
  targets: [{ kind: "permanent", filter: { notTypes: ["land"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "for-each-player",
        who: "each-player",
        except: { controllerOf: 0 },
        simultaneous: true,
        effect: { kind: "create-token-copy", of: 0, count: 1, who: "that-player" },
      },
    ],
  },
});
