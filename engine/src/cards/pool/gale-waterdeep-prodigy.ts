import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 5076.
//
// "A card of the other type" depends on the spell cast, so the one printed
// ability is written once per type: an instant spell looks for a sorcery
// card, a sorcery spell for an instant card. No spell is both, so exactly
// one of the two triggers for any cast. The card is cast as the ability
// resolves, timing ignored, for its costs.
const TEXT =
  "Whenever you cast an instant or sorcery spell from your hand, you may cast up to one target card of the other type from your graveyard. If a spell cast from your graveyard this way would be put into your graveyard, exile it instead.";

const half = (cast: "instant" | "sorcery", other: "instant" | "sorcery"): TriggeredAbility => ({
  trigger: { on: "cast-spell", who: "you", from: "hand", filter: { type: cast } },
  targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: other } } }],
  effect: { kind: "cast-now", from: "targets", exileAfter: true },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Gale, Waterdeep Prodigy",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  pairing: { kind: "choose-a-background" },
  text: `${TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  triggered: [half("instant", "sorcery"), half("sorcery", "instant")],
});
