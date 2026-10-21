import { defineCard } from "../define.js";

// EDHREC rank 7737. Not a modal spell (the ruling): whether to tap or untap —
// or do neither — is chosen as it resolves, so it's a `modal` effect asked at
// resolution (Retreat to Coralhelm's inner choice), not `castModal`.

export default defineCard({
  name: "Twiddle",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may tap or untap target artifact, creature, or land.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature", "land"] } }],
  effect: {
    kind: "modal",
    minModes: 0,
    maxModes: 1,
    modes: [
      { text: "Tap it", effect: { kind: "tap", target: 0 } },
      { text: "Untap it", effect: { kind: "untap", target: 0 } },
    ],
  },
});
