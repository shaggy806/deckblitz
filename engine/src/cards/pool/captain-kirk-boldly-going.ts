import type { EffectSpec, SearchZones } from "../../effects.js";
import { defineCard } from "../define.js";

const SEARCH_TEXT =
  "Whenever Captain Kirk enters or attacks, search your library and/or graveyard for a basic land card or a card named Starship Enterprise, reveal it, and put it into your hand. If you search your library this way, shuffle.";
const PUMP_TEXT = "Spacecraft creatures you control get +3/+3.";

const search = (zones: SearchZones): EffectSpec => ({
  kind: "search-library",
  filter: { anyOf: [{ type: "land", supertype: "basic" }, { name: "Starship Enterprise" }] },
  destination: "hand",
  reveal: true,
  min: 0,
  max: 1,
  zones,
});

const SEARCH: EffectSpec = {
  kind: "modal",
  minModes: 1,
  maxModes: 1,
  modes: [
    { text: "Search your library and graveyard", effect: search("library-and-graveyard") },
    { text: "Search your library", effect: search("library") },
    { text: "Search your graveyard", effect: search("graveyard") },
  ],
};

export default defineCard({
  name: "Captain Kirk, Boldly Going",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${PUMP_TEXT}\n${SEARCH_TEXT}`,
  static: [{ affects: { scope: "creatures-you-control", subtype: "Spacecraft" }, grantPt: [3, 3], text: PUMP_TEXT }],
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: SEARCH, resolve: null, text: SEARCH_TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: SEARCH, resolve: null, text: SEARCH_TEXT },
  ],
});
