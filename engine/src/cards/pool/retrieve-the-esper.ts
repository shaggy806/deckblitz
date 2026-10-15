import { defineCard } from "../define.js";

// EDHREC rank 16952.
// Makes Robot Warrior → "Robot Warrior Token".
//
// "That token" is the one this resolution made (`thisWay: "created"`,
// Applied Geometry), and "if this spell was cast from a graveyard" Moment of
// Glory's `source` condition — flashback is the usual way, but any cast from
// a graveyard counts.

const TEXT =
  "Create a 3/3 blue Robot Warrior artifact creature token. Then if this spell was cast from a graveyard, put two +1/+1 counters on that token.";

export default defineCard({
  name: "Retrieve the Esper",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{5}{U}" },
  text: `${TEXT}\nFlashback {5}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Robot Warrior Token", count: 1 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "graveyard" } },
        then: { kind: "add-counter-all", filter: { thisWay: "created" }, counter: "+1/+1", amount: 2 },
      },
    ],
  },
});
