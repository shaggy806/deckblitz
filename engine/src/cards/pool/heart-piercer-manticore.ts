import { defineCard } from "../define.js";
import { embalmAbility } from "../helpers.js";

// EDHREC rank 19661. Amonkhet. Ziatora's shape: the sacrifice is a choice as
// the untargeted enters trigger resolves, and only a creature sacrificed that
// way fires the reflexive damage, whose target is chosen then. The power is
// the sacrificed creature's last-known (the rulings).
const ENTER_TEXT =
  "When this creature enters, you may sacrifice another creature. When you do, this creature deals damage equal to that creature's power to any target.";
const EMBALM_TEXT =
  "Embalm {5}{R} ({5}{R}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Manticore with no mana cost. Embalm only as a sorcery.)";

export default defineCard({
  name: "Heart-Piercer Manticore",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Manticore"],
  power: 4,
  toughness: 3,
  text: `${ENTER_TEXT}\n${EMBALM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["any-target"],
          value: { powerOf: "sacrificed" },
          effect: { kind: "damage", target: 0, amount: { triggerValue: true } },
          text: "When you do, this creature deals damage equal to that creature's power to any target.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [embalmAbility("{5}{R}", EMBALM_TEXT)],
});
