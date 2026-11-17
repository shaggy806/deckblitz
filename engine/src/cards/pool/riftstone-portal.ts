import { defineCard } from "../define.js";
import { addManaAbility, manaTapAbility } from "../helpers.js";

// EDHREC rank 11962. The grant works only from its owner's graveyard
// (`fromGraveyard`, rule 113.6b), for the lands that player controls; on the
// battlefield it does nothing. "{T}: Add {G} or {W}" is two mana abilities,
// as the dual lands print it.

const GRAVEYARD_TEXT = 'As long as this card is in your graveyard, lands you control have "{T}: Add {G} or {W}."';

export default defineCard({
  name: "Riftstone Portal",
  types: ["land"],
  text: `{T}: Add {C}.\n${GRAVEYARD_TEXT}`,
  activated: [addManaAbility({ mana: "C", text: "{T}: Add {C}." })],
  static: [
    {
      affects: { scope: "lands-you-control" },
      fromGraveyard: true,
      grantsActivated: [manaTapAbility("G"), manaTapAbility("W")],
      text: GRAVEYARD_TEXT,
    },
  ],
});
