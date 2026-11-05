import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may search your library and/or graveyard for a Shrine card and put it onto the battlefield. If you search your library this way, shuffle.";
const DOUBLE_TEXT =
  "If a triggered ability of another Shrine you control triggers while you control six or more Shrines, that ability triggers an additional time.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { subtype: "Shrine" },
  destination: "battlefield",
  min: 0,
  max: 1,
  zones,
});

export default defineCard({
  name: "Sanctum of All",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Shrine"],
  text: `${UPKEEP_TEXT}\n${DOUBLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library and/or graveyard for a Shrine card?",
        effect: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
            { text: "Search your library", effect: search("library") },
            { text: "Search your graveyard", effect: search("graveyard") },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Shrine" }, atLeast: 6, countsSelf: true },
      doubleTriggersOf: { filter: { subtype: "Shrine", controlledBy: "you" }, others: true },
      text: DOUBLE_TEXT,
    },
  ],
});
