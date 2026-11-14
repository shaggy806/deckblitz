import { defineCard } from "../define.js";

// EDHREC rank 9480.
//
// "That player" is the attacking player, the active one (rule 506.2); "being
// attacked" is a creature attacking the player now, whatever is attacking
// their planeswalkers or battles (the ruling). Asked as the ability triggers
// and again as it resolves (603.4): an opponent who left the game since, or
// is attacked now, no longer counts.

const TEXT =
  "Whenever a player attacks you, if that player has another opponent who isn't being attacked, prevent all combat damage that would be dealt to you this combat.";

export default defineCard({
  name: "Suppressor Skyguard",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "you" },
      condition: { kind: "unattacked-opponent", of: "active-player", another: true },
      targets: [],
      effect: { kind: "damage-rule", to: { players: "you" }, combat: true, duration: "until-end-of-combat" },
      resolve: null,
      text: TEXT,
    },
  ],
});
