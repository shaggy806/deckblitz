import { defineCard } from "../define.js";

const FIGHT = "Whenever this creature or another Vampire you control enters, this creature fights up to one target creature an opponent controls.";
const BLOOD =
  'Whenever a creature dealt damage by this creature this turn dies, create a Blood token. (It\'s an artifact with "{1}, {T}, Discard a card, Sacrifice this token: Draw a card.")';

const fight = {
  targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
  effect: { kind: "fight", a: "source", b: 0 },
  resolve: null,
  text: FIGHT,
} as const;

export default defineCard({
  name: "Markov Enforcer",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 6,
  toughness: 6,
  text: `${FIGHT}\n${BLOOD}`,
  // "This creature or another Vampire": two triggers, so it fires for itself
  // whatever it is (Thorn Mammoth).
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, ...fight },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Vampire" }, otherOnly: true },
      ...fight,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "this" } } },
      targets: [],
      effect: { kind: "create-token", token: "Blood Token", count: 1 },
      resolve: null,
      text: BLOOD,
    },
  ],
});
