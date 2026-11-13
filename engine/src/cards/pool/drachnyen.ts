import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The exiled card is linked to Drach'Nyen (rule 607.2a). X is the total
// power of the cards exiled with it — more than one only when its trigger was
// copied (the ruling) — each read as it is in exile, a `*` its CDA sets
// included, and 0 for a card with no printed power.
const ECHO_TEXT = "Echo of the First Murder — When Drach'Nyen enters, exile up to one target creature.";
const SWORD_TEXT =
  "Daemon Sword — Equipped creature has menace and gets +X/+0, where X is the exiled card's power.";

export default defineCard({
  name: "Drach'Nyen",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ECHO_TEXT}\n${SWORD_TEXT}\nEquip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { type: "creature" } } }],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ECHO_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["menace"],
      grantPtPerCount: {
        aggregate: { aggregate: "sum", of: "power", filter: {}, in: "exiled-with-source" },
        pt: [1, 0],
      },
      text: SWORD_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
