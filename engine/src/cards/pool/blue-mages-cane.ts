import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";
import { equip } from "../helpers.js";

// Final Fantasy. Job select is Black Mage's Rod's shape. The copy is cast while
// the granted ability resolves or not at all; {3} is a `cast-now`'s `byPaying`,
// an alternative cost, so an {X} in its cost is 0 and additional costs are still
// paid (the rulings). A copy not cast ceases to exist (rule 704.5e).
const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const ATTACK_TEXT =
  "Whenever this creature attacks, exile up to one target instant or sorcery card from defending player's graveyard. If you do, copy it. You may cast the copy by paying {3} rather than paying its mana cost.";
const EQUIPPED_TEXT = `Equipped creature gets +0/+2, is a Wizard in addition to its other types, and has "${ATTACK_TEXT}"`;

const ON_ATTACK: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [
    {
      kind: "optional",
      of: { kind: "card-in-graveyard", whose: "defending-player", filter: { typesAnyOf: ["instant", "sorcery"] } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "cast-now", from: "exiled-this-way", copies: 1, byPaying: "{3}" },
    ],
  },
  resolve: null,
  text: ATTACK_TEXT,
};

export default defineCard({
  name: "Blue Mage's Cane",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nSpirit of the Whalaqee — Equip {2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: JOB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 2],
      grantsTriggered: [ON_ATTACK],
      addSubtypes: ["Wizard"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [{ ...equip("{2}"), text: "Spirit of the Whalaqee — Equip {2}" }],
});
