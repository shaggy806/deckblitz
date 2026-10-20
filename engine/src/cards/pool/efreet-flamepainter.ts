import { defineCard } from "../define.js";

// EDHREC rank 15717. Deluxe Dragster's trigger over your own graveyard: the
// spell is cast as the trigger resolves, ignoring timing (the ruling), or
// not at all. Double strike can trigger it twice in one combat.
const TEXT =
  "Whenever this creature deals combat damage to a player, you may cast target instant or sorcery card from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Efreet Flamepainter",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet", "Shaman"],
  power: 1,
  toughness: 4,
  keywords: ["double-strike"],
  text: `Double strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
