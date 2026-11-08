import { defineCard } from "../define.js";

const ENTER_TEXT = "As this creature enters, exile any number of creature cards from your graveyard.";
const PT_TEXT =
  "Sutured Ghoul's power is equal to the total power of the exiled cards and its toughness is equal to their total toughness.";

export default defineCard({
  name: "Sutured Ghoul",
  manaCost: "{4}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 0,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { exile: { filter: { type: "creature" }, count: "any" } },
      },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { aggregate: "sum", of: "power", filter: {}, in: "exiled-with-source" }, plusPower: 0, plusToughness: 0, only: "power" },
      text: PT_TEXT,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { aggregate: "sum", of: "toughness", filter: {}, in: "exiled-with-source" }, plusPower: 0, plusToughness: 0, only: "toughness" },
      text: PT_TEXT,
    },
  ],
});
