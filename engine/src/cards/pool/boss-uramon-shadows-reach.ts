import { defineCard } from "../define.js";

// Mystery Booster Commander.
const DEATHTOUCH = "Attacking Ninjas and Rogues you control have deathtouch.";
const RAT =
  "Whenever one or more Ninjas and/or Rogues you control deal combat damage to a player, create a 1/1 black Rat Rogue creature token.";

export default defineCard({
  name: "Boss Uramon, Shadow's Reach",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${DEATHTOUCH}\n${RAT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { attacking: true, controlledBy: "you", anyOf: [{ subtype: "Ninja" }, { subtype: "Rogue" }] },
      },
      grantKeywords: ["deathtouch"],
      text: DEATHTOUCH,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "deals-damage-batch",
        who: "you-control",
        filter: { anyOf: [{ subtype: "Ninja" }, { subtype: "Rogue" }] },
        combat: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Rat Rogue Token (Tribute to Horobi)", count: 1 },
      resolve: null,
      text: RAT,
    },
  ],
});
