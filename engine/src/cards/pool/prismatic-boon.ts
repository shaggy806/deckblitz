import type { EffectSpec } from "../../effects.js";
import type { Color } from "../../mana.js";
import { defineCard } from "../define.js";

// EDHREC rank 20387.
//
// One colour is chosen as the spell resolves and every target gains
// protection from it: a resolution-time choice of five untargeted modes, each
// granting that colour to the whole group (a `{ choose: "color" }` inside the
// per-target loop would ask once per creature).

const COLORS: readonly { readonly color: Color; readonly name: string }[] = [
  { color: "W", name: "White" },
  { color: "U", name: "Blue" },
  { color: "B", name: "Black" },
  { color: "R", name: "Red" },
  { color: "G", name: "Green" },
];

const CHOOSE: EffectSpec = {
  kind: "modal",
  minModes: 1,
  maxModes: 1,
  modes: COLORS.map(({ color, name }) => ({
    text: name,
    effect: {
      kind: "for-each-target",
      from: 0,
      effect: { kind: "grant-protection", target: 0, from: { colors: [color] }, duration: "end-of-turn" },
    } satisfies EffectSpec,
  })),
};

export default defineCard({
  name: "Prismatic Boon",
  manaCost: "{X}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text: "Choose a color. X target creatures gain protection from the chosen color until end of turn.",
  targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
  effect: CHOOSE,
});
