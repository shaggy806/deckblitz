import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// EDHREC rank 18767.
//
// I: one optional slot per player's seat, yours (seat 0) included (Unexplained
// Absence's shape), destroyed as one instruction. Then, for each slot whose
// creature was destroyed this way (an indestructible or regenerated one wasn't,
// and a blank or illegal slot holds nothing — rule 608.2b), its controller as
// it last existed (rule 111.11, `"target-controller"` on the bound slot)
// creates a 3/3 green Mutant with deathtouch; the tokens are made together.
// II: "becomes a 6/6 legendary Horror creature" with no "in addition" sets its
// creature types (rule 205.1a) and its base P/T, for good; the name is the
// only name it has (`nameOf`), so III's "named Fenric" reads it.
// III: "another target creature named Fenric" — any player's.
const I_TEXT =
  "I — For each player, destroy up to one target creature that player controls. For each creature destroyed this way, its controller creates a 3/3 green Mutant creature token with deathtouch.";
const II_TEXT =
  "II — Target nontoken creature becomes a 6/6 legendary Horror creature named Fenric and loses all abilities.";
const III_TEXT = "III — Target Mutant fights another target creature named Fenric.";

const perPlayer = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "The Curse of Fenric",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [perPlayer(0), perPlayer(1), perPlayer(2), perPlayer(3)],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "destroy", target: 0 },
              { kind: "destroy", target: 1 },
              { kind: "destroy", target: 2 },
              { kind: "destroy", target: 3 },
            ],
          },
          {
            kind: "for-each-target",
            from: 0,
            only: { thisWay: "destroyed" },
            simultaneous: true,
            effect: { kind: "create-token", token: "Mutant Token (Green, Deathtouch)", count: 1, who: "target-controller" },
          },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [{ kind: "permanent", filter: { type: "creature", token: false } }],
      effect: {
        kind: "become",
        target: 0,
        power: 6,
        toughness: 6,
        addTypes: ["creature"],
        setSubtypes: ["Horror"],
        addSupertypes: ["legendary"],
        name: "Fenric",
        loseAbilities: true,
        duration: "permanent",
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [
        { kind: "permanent", filter: { type: "creature", subtypes: ["Mutant"] } },
        { kind: "other", of: { kind: "permanent", filter: { type: "creature", name: "Fenric" } }, than: { slot: 0 } },
      ],
      effect: { kind: "fight", a: 0, b: 1 },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
