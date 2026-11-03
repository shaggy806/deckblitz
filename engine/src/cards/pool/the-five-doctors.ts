import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";
import { searchZonesAndOr } from "../helpers.js";

// "Your library and/or graveyard": the player's choice of zones as it resolves,
// only a search of the library shuffling. "Up to five" may find none, in the
// graveyard too (`upTo`). Kicked, the same search puts the finds onto the
// battlefield instead.

const search = (destination: "hand" | "battlefield"): EffectSpec =>
  searchZonesAndOr(["library", "graveyard"], {
    kind: "search-library",
    filter: { subtype: "Doctor" },
    destination,
    min: 0,
    max: 5,
    upTo: true,
    reveal: true,
  });

export default defineCard({
  name: "The Five Doctors",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Kicker {5} (You may pay an additional {5} as you cast this spell.)\nSearch your library and/or graveyard for up to five Doctor cards, reveal them, and put them into your hand. If you search your library this way, shuffle. If this spell was kicked, put those cards onto the battlefield instead of putting them into your hand.",
  targets: [],
  effect: search("hand"),
  kicker: { cost: "{5}", effect: search("battlefield") },
});
