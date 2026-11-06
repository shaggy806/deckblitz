import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 223.
//
// Cast, it targets a creature card in a graveyard and enters attached to it
// (rule 303.4a: its enchant ability is that slot; `enchantsGraveyardCard`);
// put onto the battlefield another way, its controller chooses such a card
// (303.4f). Its enters ability, if it's still on the battlefield (an
// intervening "if", rule 603.4), swaps its enchant ability, returns the card
// and attaches itself to the new object (`swap-enchant`, then
// `attach` to `"put-this-way"`). From then on it can be attached only to that
// creature (the ruling); if it can't attach (protection from black), the
// state-based check puts it into the graveyard (704.5m).
//
// "When this Aura leaves the battlefield, that creature's controller
// sacrifices it" is a delayed triggered ability the enters ability makes (its
// ruling), keyed to the creature returned — not to whatever it's attached to,
// so it still fires when the Aura couldn't attach, and never when nothing came
// back.
const ENTERS =
  "When this Aura enters, if it's on the battlefield, it loses \"enchant creature card in a graveyard\" and gains \"enchant creature put onto the battlefield with this Aura.\" Return enchanted creature card to the battlefield under your control and attach this Aura to it. When this Aura leaves the battlefield, that creature's controller sacrifices it.";
const LEAVES = "When this Aura leaves the battlefield, that creature's controller sacrifices it.";
const LEAVING = ["graveyard", "exile", "hand", "library", "command"] as const;

export default defineCard({
  name: "Animate Dead",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature card in a graveyard\n${ENTERS}\nEnchanted creature gets -1/-0.`,
  targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "put-onto-battlefield", target: "attached", underYourControl: true },
            { kind: "swap-enchant", enchant: "put-this-way" },
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
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [-1, 0],
      text: "Enchanted creature gets -1/-0.",
    },
  ],
});
