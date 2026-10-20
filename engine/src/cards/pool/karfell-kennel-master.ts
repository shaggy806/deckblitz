import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// Kaldheim (KHM). EDHREC rank 25794. Invasion of Kylem's two optional,
// distinct target slots.
const TEXT =
  "When this creature enters, up to two target creatures each get +1/+0 and gain indestructible until end of turn.";

const pump = (slot: number) =>
  [
    { kind: "modify-pt", target: slot, power: 1, toughness: 0, duration: "end-of-turn" },
    { kind: "grant-keyword", target: slot, keyword: "indestructible", duration: "end-of-turn" },
  ] as const;

export default defineCard({
  name: "Karfell Kennel-Master",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Berserker"],
  power: 4,
  toughness: 4,
  text: `${TEXT} (Damage and effects that say "destroy" don't destroy them.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: distinctTargets(2, "creature", { optional: true }),
      effect: { kind: "sequence", effects: [...pump(0), ...pump(1)] },
      resolve: null,
      text: TEXT,
    },
  ],
});
