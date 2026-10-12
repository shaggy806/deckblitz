import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 9509.

// The combat-damage dig is Forbidden Alchemy's look-and-choose, "that many"
// being the damage dealt (Cold-Eyed Selkie's `triggerValue`). Find New Host
// is Wither and Bloom's exile-from-graveyard ability; "this card's other
// abilities" is that one triggered ability, granted for good (Dreadmaw's
// Ire's `grant-triggered`, `"permanent"`) — "this creature" in it is then
// the host.
const DIG_TEXT =
  "Whenever this creature deals combat damage to a player, look at that many cards from the top of your library. Put one of them into your hand and the rest into your graveyard.";
const HOST_TEXT =
  "Find New Host — {2}{U/B}, Exile this card from your graveyard: Put a +1/+1 counter on target creature you control. It gains this card's other abilities. Activate only as a sorcery.";

const DIG: TriggeredAbility = {
  trigger: { on: "deals-combat-damage-to-player", who: "self" },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: { triggerValue: true },
    min: 1,
    max: 1,
    destination: "hand",
    leftover: "graveyard",
  },
  resolve: null,
  text: DIG_TEXT,
};

export default defineCard({
  name: "Symbiote Spider-Man",
  manaCost: "{2}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Symbiote", "Spider", "Hero"],
  power: 2,
  toughness: 4,
  text: `${DIG_TEXT}\n${HOST_TEXT}`,
  triggered: [DIG],
  activated: [
    {
      cost: { mana: "{2}{U/B}", tap: false },
      zone: "graveyard",
      sorcerySpeed: true,
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "grant-triggered", target: 0, ability: DIG, duration: "permanent" },
        ],
      },
      resolve: null,
      text: HOST_TEXT,
    },
  ],
});
