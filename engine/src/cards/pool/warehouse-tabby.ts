import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Enchantment tokens (such as Roles) that are sacrificed, destroyed, or would
//     otherwise go to the graveyard are put into their owner's graveyard before ceasing to exist.
//     If you controlled the token, Warehouse Tabby's ability will trigger.
//   [2023-09-01] If Warehouse Tabby leaves the battlefield while it has an Aura you control
//     attached to it or at the same time as another creature with an Aura you control attached to
//     it, its ability won't trigger for those enchantments unless they were destroyed by the same
//     effect that caused Warehouse Tabby to leave the battlefield.
// "Put into a graveyard from the battlefield" is the `dies` trigger for any permanent type
// (Starfield Mystic); an Aura put there later by state-based actions is a separate event the
// Tabby, already gone, doesn't see.

const RAT =
  "Whenever an enchantment you control is put into a graveyard from the battlefield, create a 1/1 black Rat creature token with \"This token can't block.\"";
const DEATHTOUCH = "{1}{B}: This creature gains deathtouch until end of turn.";

export default defineCard({
  name: "Warehouse Tabby",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 1,
  toughness: 1,
  text: `${RAT}\n${DEATHTOUCH}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: DEATHTOUCH,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "create-token", token: "Rat Token (Can't Block)", count: 1 },
      resolve: null,
      text: RAT,
    },
  ],
});
