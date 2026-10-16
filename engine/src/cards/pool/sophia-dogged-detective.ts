import { investigate } from "../helpers.js";
import { defineCard } from "../define.js";

const TINY = "When Sophia enters, create Tiny, a legendary 2/2 green Dog Detective creature token with trample.";
const COUNTERS = "{1}, Sacrifice an artifact token: Put a +1/+1 counter on each Dog you control.";
const DAMAGE = "Whenever a Dog you control deals combat damage to a player, create a Food token, then investigate.";

export default defineCard({
  name: "Sophia, Dogged Detective",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 3,
  toughness: 4,
  text: `${TINY}\n${COUNTERS}\n${DAMAGE}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { token: true, type: "artifact" } } },
      targets: [],
      effect: { kind: "add-counter-all", filter: { subtype: "Dog", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTERS,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Tiny", count: 1 },
      resolve: null,
      text: TINY,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { subtype: "Dog" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "create-token", token: "Food Token", count: 1 }, investigate()],
      },
      resolve: null,
      text: DAMAGE,
    },
  ],
});
