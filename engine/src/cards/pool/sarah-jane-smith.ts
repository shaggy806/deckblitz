import { defineCard } from "../define.js";

// Glóin, Dwarf Emissary's "whenever you cast a historic spell … This ability
// triggers only once each turn", investigating instead.
const HISTORIC = { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] } as const;
const CAST_TEXT =
  "Whenever you cast a historic spell, investigate. This ability triggers only once each turn. (Artifacts, legendaries, and Sagas are historic. To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Sarah Jane Smith",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 1,
  pairing: { kind: "doctors-companion" },
  text: `${CAST_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: HISTORIC },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
