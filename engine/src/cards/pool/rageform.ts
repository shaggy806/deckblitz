import { defineCard } from "../define.js";

// Fate Reforged. EDHREC rank 26200.
//
// An enchantment until its enters ability resolves: then it becomes an Aura
// with enchant creature (`swap-enchant` with `becomeAura` — layer 4 at that
// timestamp, rule 613.7), manifests the top card of your library (rule
// 701.40a) and attaches itself to it (`"put-this-way"`: a manifest puts its
// card onto the battlefield). No intervening "if": with this gone, the card is
// still manifested (the ruling) and nothing attaches; with an empty library
// it's an Aura attached to nothing, put into the graveyard (704.5m). Turned
// face up, the creature is still enchanted (the ruling).
const ENTERS =
  "When this enchantment enters, it becomes an Aura with enchant creature. Manifest the top card of your library and attach this enchantment to it. (To manifest a card, put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";
const STATIC = "Enchanted creature has double strike. (It deals both first-strike and regular combat damage.)";

export default defineCard({
  name: "Rageform",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTERS}
${STATIC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "swap-enchant", enchant: "creature", becomeAura: true },
          { kind: "manifest", who: "you" },
          { kind: "attach", target: "put-this-way" },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantKeywords: ["double-strike"], text: STATIC }],
});
