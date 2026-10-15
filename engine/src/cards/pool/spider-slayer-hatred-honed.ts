import { defineCard } from "../define.js";

// EDHREC rank 18986.
//
// Any damage it deals — combat or not — to a Spider (Stinkweed Imp's
// trigger without its combat-only clause); the creature is destroyed as
// the trigger resolves, if it's still there.

const SLAY_TEXT = "Whenever Spider-Slayer deals damage to a Spider, destroy that creature.";
const ROBOTS_TEXT =
  "{6}, Exile this card from your graveyard: Create two tapped 1/1 colorless Robot artifact creature tokens with flying.";

export default defineCard({
  name: "Spider-Slayer, Hatred Honed",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 1,
  text: `${SLAY_TEXT}\n${ROBOTS_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token (Flying)", count: 2, tapped: true },
      resolve: null,
      text: ROBOTS_TEXT,
      zone: "graveyard",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", toFilter: { subtype: "Spider" } },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient" },
      resolve: null,
      text: SLAY_TEXT,
    },
  ],
});
