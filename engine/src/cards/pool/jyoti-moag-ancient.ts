import { defineCard } from "../define.js";

// EDHREC rank 10890. Modern Horizons 3 Commander.
//
// Rulings:
//   [2024-06-07] A commander cast that was countered still counts.
//   [2024-06-07] X is calculated only once, as the last ability resolves.
//   [2024-06-07] With two commanders, every time either was cast from the command zone counts.
//
// `{ commanderCasts: "you" }` is the casts of all your commanders added up
// (Thunderclap Drake's), and the tokens are Staff of Titania's Forest Dryads.
// The pump reads Jyoti's power once, as it resolves (`modify-pt-all`).
const ENTER_TEXT =
  "When Jyoti enters, create a 1/1 green Forest Dryad land creature token for each time you've cast your commander from the command zone this game. (They're affected by summoning sickness.)";
const COMBAT_TEXT =
  "At the beginning of each combat, land creatures you control get +X/+X until end of turn, where X is Jyoti's power.";

export default defineCard({
  name: "Jyoti, Moag Ancient",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 4,
  text: `${ENTER_TEXT}\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Forest Dryad Token", count: { commanderCasts: "you" } },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { types: ["land", "creature"], controlledBy: "you" },
        power: { powerOf: "source" },
        toughness: { powerOf: "source" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
