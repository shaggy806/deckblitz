import { defineCard } from "../define.js";

// EDHREC rank 13050.
//
// Imprint is Duplicant's linked exile (rule 607.2a). The bonus reads the
// card in exile live, as it is there: a creature card only (a land that was
// animated gives nothing), its `*` from a characteristic-defining ability
// counted, its old counters and Equipment not (the rulings) — power and
// toughness each a sum over the cards exiled with this stint, in two parts. A
// negative power adds nothing (rule 107.1b).
const IMPRINT = "Imprint — When this creature enters, you may exile target nontoken creature.";
const BONUS = "This creature gets +X/+Y, where X is the exiled creature card's power and Y is its toughness.";

export default defineCard({
  name: "Phyrexian Ingester",
  manaCost: "{6}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 3,
  toughness: 3,
  text: `${IMPRINT}\n${BONUS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", token: false } }],
      effect: {
        kind: "may",
        prompt: "Exile target nontoken creature?",
        effect: { kind: "exile", target: 0, linked: true },
      },
      resolve: null,
      text: IMPRINT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        aggregate: { aggregate: "sum", of: "power", filter: { type: "creature" }, in: "exiled-with-source" },
        pt: [1, 0],
      },
      text: BONUS,
    },
    {
      affects: { scope: "self" },
      grantPtPerCount: {
        aggregate: { aggregate: "sum", of: "toughness", filter: { type: "creature" }, in: "exiled-with-source" },
        pt: [0, 1],
      },
      text: BONUS,
    },
  ],
});
