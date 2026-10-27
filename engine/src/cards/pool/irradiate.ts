import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 27869.
//
// The artifacts are counted as it resolves; the result doesn't change later in
// the turn (Mutilate's shape).

const PER_ARTIFACT = { product: [{ countOf: { type: "artifact", controlledBy: "you" } }, -1] } as const;

export default defineCard({
  name: "Irradiate",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -1/-1 until end of turn for each artifact you control.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: PER_ARTIFACT, toughness: PER_ARTIFACT, duration: "end-of-turn" },
});
