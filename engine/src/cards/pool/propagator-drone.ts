import { defineCard } from "../define.js";
import { evolve } from "../helpers.js";

// EDHREC rank 9006. Evolve granted to creature tokens you control (Mikaeus's
// `grantsTriggered` shape): each token compares itself with the entering
// creature, as it enters and again as the trigger resolves. Granted while
// Propagator Drone is on the battlefield, so the tokens see it enter too.
const GRANT_TEXT =
  'Creature tokens you control have evolve. (They have "Whenever a creature you control enters, if it has greater power or toughness than this token, put a +1/+1 counter on this token." They see this creature enter.)';
const SPAWN_TEXT =
  '{3}{G}: Create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Propagator Drone",
  manaCost: "{1}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 2,
  text: `Devoid (This card has no color.)\n${GRANT_TEXT}\n${SPAWN_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", token: true, controlledBy: "you" } },
      grantsTriggered: [evolve()],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
      resolve: null,
      text: SPAWN_TEXT,
    },
  ],
});
