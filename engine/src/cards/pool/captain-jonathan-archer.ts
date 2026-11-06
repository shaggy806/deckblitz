import { defineCard } from "../define.js";

const ENTER_TEXT = "When Captain Archer enters, create Porthos, a legendary 1/1 green Dog creature token.";
const FEDERATION_TEXT =
  "Federation — {G}, {T}: Target creature you control gets +X/+X until end of turn, where X is the number of creature types among non-Borg creatures you control. Activate only as a sorcery.";

/** Federation's X: the different creature types among your non-Borg creatures (a changeling counts every type, rule 702.73a). */
const FEDERATION_X = {
  aggregate: "distinct",
  of: { subtypesOf: "creature" },
  filter: { type: "creature", controlledBy: "you", notSubtypes: ["Borg"] },
} as const;

export default defineCard({
  name: "Captain Jonathan Archer",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${FEDERATION_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Porthos", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: FEDERATION_X, toughness: FEDERATION_X, duration: "end-of-turn" },
      resolve: null,
      text: FEDERATION_TEXT,
      sorcerySpeed: true,
    },
  ],
});
