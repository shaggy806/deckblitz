import { defineCard } from "../define.js";

// EDHREC rank 20811.
// Rulings: the player is chosen at random, but Strax's controller chooses
// which of that player's creatures it fights — the reflexive ability's target,
// chosen as it's put on the stack (603.12). Any player can be chosen, Strax's
// controller included (another creature they control).

const GRENADES =
  "Grenades! — {2}, {T}, Sacrifice an artifact: Choose a player at random. When you do, Strax fights another target creature that player controls.";
const GLORY = "Glory of Battle — Whenever Strax deals damage to a creature, put a +1/+1 counter on Strax.";

export default defineCard({
  name: "Strax, Sontaran Nurse",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien", "Cleric"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${GRENADES}\n${GLORY}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "choose-opponent",
        random: true,
        anyPlayer: true,
        then: {
          kind: "reflexive-trigger",
          player: "that-player",
          targets: [{ kind: "other", of: { kind: "permanent", filter: { type: "creature" }, whose: "trigger-player" } }],
          effect: { kind: "fight", a: "source", b: 0 },
          text: "When you do, Strax fights another target creature that player controls.",
        },
      },
      resolve: null,
      text: GRENADES,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: GLORY,
    },
  ],
});
