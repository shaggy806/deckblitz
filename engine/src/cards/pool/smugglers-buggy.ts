import { defineCard } from "../define.js";
import { crew, hideaway } from "../helpers.js";

// Hideaway (rule 702.75): the exiled card is linked to this Vehicle
// (607.2a). "Cast", not "play": a land card exiled with it can't be put onto
// the battlefield this way. "If you do" — the Vehicle goes back to its
// owner's hand only once the spell has been cast.
const DAMAGE_TEXT =
  "Whenever this Vehicle deals combat damage to a player, you may cast the exiled card without paying its mana cost. If you do, return this Vehicle to its owner's hand.";

export default defineCard({
  name: "Smuggler's Buggy",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text:
    "Hideaway 4 (When this artifact enters, look at the top four cards of your library, exile one face down, then put the rest on the bottom in a random order.)\n" +
    `${DAMAGE_TEXT}\nCrew 2`,
  triggered: [
    hideaway(4, "artifact"),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: "exiled-with-source",
        free: true,
        then: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [crew(2)],
});
