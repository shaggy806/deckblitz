import { defineCard } from "../define.js";

// Visions. EDHREC rank 1030.
//
// An enchantment, not an Aura, until its enters ability resolves (an
// intervening "if", rule 603.4): then it becomes an Aura whose enchant
// ability names only the creature it puts onto the battlefield
// (`swap-enchant` with `becomeAura` — a layer-4 effect at that
// timestamp), and attaches itself to it. The ability targets the card, so if
// that's gone it doesn't resolve and Necromancy stays a plain enchantment; a
// card that can't come back leaves it an Aura attached to nothing, which the
// state-based check puts into the graveyard (704.5m). Its leaves ability is a
// delayed one that enters ability makes, keyed to the creature it returned
// (as Animate Dead's ruling has it). Cast at instant speed
// (`flashThenSacrifice`), the permanent it became is sacrificed at the next
// cleanup step, which sacrifices the creature too.
const ENTERS =
  "When this enchantment enters, if it's on the battlefield, it becomes an Aura with \"enchant creature put onto the battlefield with Necromancy.\" Put target creature card from a graveyard onto the battlefield under your control and attach this enchantment to it. When this enchantment leaves the battlefield, that creature's controller sacrifices it.";
const LEAVES = "When this enchantment leaves the battlefield, that creature's controller sacrifices it.";
const LEAVING = ["graveyard", "exile", "hand", "library", "command"] as const;

export default defineCard({
  name: "Necromancy",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  flashThenSacrifice: true,
  text: `You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: 0, underYourControl: true },
            { kind: "swap-enchant", enchant: "put-this-way", becomeAura: true },
            { kind: "attach", target: "put-this-way" },
            {
              kind: "delayed-trigger",
              at: { leaves: "source", to: LEAVING },
              about: "put-onto-battlefield",
              effect: { kind: "sacrifice-target", target: 0, byItsController: true },
              text: LEAVES,
            },
          ],
        },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
