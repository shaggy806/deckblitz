import { defineCard } from "../define.js";
import type { EffectSpec, ModeOption } from "../../effects.js";
import type { Sector } from "../../state.js";

const SECTORS: readonly Sector[] = ["alpha", "beta", "gamma"];

// EDHREC rank 17349. Unfinity, black-bordered: Commander-legal.
//
// Space sculptor (rule 702.158) is the `"space-sculptor"` keyword: while it's
// on the battlefield each creature gets a sector designation as a state-based
// action (704.5u, `Game.checkSectors`) — opponents first — kept until no
// player controls a permanent with space sculptor and no ability of one waits
// on the stack (so the −5 from exactly 5 loyalty still finds its sectors after
// Space Beleren dies to its cost).
//
// The +1 binds every creature in a sector for the turn, one that gets a sector
// later included (a filter, rule 611.2c: it changes no characteristics). The
// −1 and −5 choose the sector as they resolve (702.158d): a resolution-time
// modal of the three.
const SCULPTOR =
  "Space sculptor (Space Beleren divides the battlefield into alpha, beta, and gamma sectors. If a creature isn't assigned to a sector, its controller assigns it to one. Opponents assign first.)";
const PLUS = "+1: Creatures in each sector can be blocked this turn only by creatures in the same sector.";
const MINUS = "−1: Put a +1/+1 counter on each creature in the sector of your choice.";
const ULT = "−5: Destroy all creatures in the sector of your choice.";

const NAMES: Record<Sector, string> = { alpha: "Alpha sector", beta: "Beta sector", gamma: "Gamma sector" };

/** "… in the sector of your choice": one mode a sector, chosen on resolution. */
function sectorOfYourChoice(effect: (sector: Sector) => EffectSpec): EffectSpec {
  const modes: ModeOption[] = SECTORS.map((sector) => ({ text: NAMES[sector], effect: effect(sector) }));
  return { kind: "modal", minModes: 1, maxModes: 1, modes };
}

export default defineCard({
  name: "Space Beleren",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 3,
  keywords: ["space-sculptor"],
  text: `${SCULPTOR}\n${PLUS}\n${MINUS}\n${ULT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "restrict",
        filter: { type: "creature", sector: "any" },
        restrictions: [{ kind: "cant-be-blocked", outsideSector: true }],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: sectorOfYourChoice((sector) => ({
        kind: "add-counter-all",
        filter: { type: "creature", sector },
        counter: "+1/+1",
        amount: 1,
      })),
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: sectorOfYourChoice((sector) => ({ kind: "destroy-all", filter: { type: "creature", sector } })),
      resolve: null,
      text: ULT,
    },
  ],
});
