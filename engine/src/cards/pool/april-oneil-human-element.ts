import { defineCard } from "../define.js";

// EDHREC rank 11989. Mona Lisa's Mutagen trigger, on artifact, instant and
// sorcery spells; it resolves even if the spell is countered (the ruling).

const CAST_TEXT =
  'Whenever a player casts an artifact, instant, or sorcery spell, you create a Mutagen token. (It\'s an artifact with "{1}, {T}, Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.")';

export default defineCard({
  name: "April O'Neil, Human Element",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 5,
  text: CAST_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { typesAnyOf: ["artifact", "instant", "sorcery"] } },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
