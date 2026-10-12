import { defineCard } from "../define.js";

export default defineCard({
  name: "Quake, Agent of S.H.I.E.L.D.",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Inhuman", "Spy", "Hero"],
  power: 3,
  toughness: 3,
  text: "Seismic Takedown — Whenever you cast a noncreature spell, tap target creature or land.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "Seismic Takedown — Whenever you cast a noncreature spell, tap target creature or land.",
    },
  ],
});
