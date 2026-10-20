import { defineCard } from "../define.js";
import type { EffectSpec, ModeOption } from "../../effects.js";

// EDHREC rank 7953.
//
// Rulings:
//   [2021-09-24] After you sacrifice one or more Zombies, a second ability triggers. Players may
//     respond to it before they have to sacrifice creatures.
//   [2021-09-24] As the reflexive triggered ability resolves, first the next opponent in turn order
//     (or, if it's an opponent's turn, the opponent whose turn it is) chooses the creatures they
//     plan to sacrifice. Then each other opponent in turn order does the same. Finally all chosen
//     creatures are sacrificed at the same time.
//
// "Up to three" is chosen as the trigger resolves — one mode per number, as
// By Invitation Only does — and the Zombies (Rotbelly itself among them) are
// then picked by the sacrifice. Choosing more than you have sacrifices all
// you have, which is the same as choosing that many. "That many" is the
// number actually sacrificed this way, read before the reflexive ability is
// made, so each opponent's edict count is fixed as it triggers.

const TEXT =
  "When this creature enters, you may sacrifice up to three Zombies. When you sacrifice one or more Zombies this way, each opponent sacrifices that many creatures of their choice.";

const edict = (n: number): EffectSpec => ({
  kind: "reflexive-trigger",
  targets: [],
  effect: { kind: "sacrifice", who: "each-opponent", filter: { type: "creature" }, count: n },
  text: `Each opponent sacrifices ${n} creature${n === 1 ? "" : "s"} of their choice.`,
});

/** The reflexive edict for however many Zombies this resolution sacrificed. */
const THAT_MANY: EffectSpec = {
  kind: "conditional",
  condition: { kind: "this-way", what: "sacrificed", atLeast: 3 },
  then: edict(3),
  else: {
    kind: "conditional",
    condition: { kind: "this-way", what: "sacrificed", atLeast: 2 },
    then: edict(2),
    else: {
      kind: "conditional",
      condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
      then: edict(1),
    },
  },
};

const MODES: ModeOption[] = [
  { text: "Sacrifice no Zombies.", effect: { kind: "sequence", effects: [] } },
  ...[1, 2, 3].map(
    (n): ModeOption => ({
      text: `Sacrifice ${n === 1 ? "a Zombie" : `${n} Zombies`}.`,
      effect: {
        kind: "sequence",
        effects: [{ kind: "sacrifice", who: "you", filter: { subtype: "Zombie" }, count: n }, THAT_MANY],
      },
    }),
  ),
];

export default defineCard({
  name: "Ravenous Rotbelly",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      resolve: null,
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      text: TEXT,
    },
  ],
});
