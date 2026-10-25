import { defineCard } from "../define.js";
import type { StaticAbility } from "../define.js";

// EDHREC rank 23949. "Choose a land type" is any existing one (the ruling):
// rule 205.3i's whole list, offered as it enters, with one static per type
// granting phasing to every land of it — live only for the type chosen
// (Wingfold Pteron's `chosen-on-enter` static condition).

const LAND_TYPES = [
  "Cave",
  "Desert",
  "Forest",
  "Gate",
  "Island",
  "Lair",
  "Locus",
  "Mine",
  "Mountain",
  "Plains",
  "Planet",
  "Power-Plant",
  "Sphere",
  "Swamp",
  "Tower",
  "Town",
  "Urza's",
] as const;

const STATIC_TEXT = "Each land of the chosen type has phasing.";

const statics: StaticAbility[] = LAND_TYPES.map((type) => ({
  affects: { scope: "filter", filter: { type: "land", subtype: type } },
  condition: { kind: "chosen-on-enter", value: type },
  grantKeywords: ["phasing"],
  text: STATIC_TEXT,
}));

export default defineCard({
  name: "Shimmer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose a land type.\n${STATIC_TEXT} (It phases in or out before its controller untaps during each of their untap steps. While it's phased out, it's treated as though it doesn't exist.)`,
  chooseOnEnter: LAND_TYPES,
  static: statics,
});
