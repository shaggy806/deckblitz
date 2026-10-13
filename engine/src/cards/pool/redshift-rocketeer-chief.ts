import { defineCard } from "../define.js";

// EDHREC rank 8961.
//
// Rulings:
//   [2025-02-07] If an ability triggers whenever you activate an exhaust ability, that ability
//     resolves before the exhaust ability resolves.
//   [2025-02-07] If an exhaust ability of a permanent is activated, and then that permanent leaves
//     the battlefield and returns to the battlefield, it becomes a new object so its exhaust
//     ability can be activated again.
//   [2025-02-07] Exhaust abilities can be activated any time you could normally activate an
//     ability.
//
// The mana is Heronblade Elite's X-of-one-colour with Omen Hawker's "only to
// activate abilities" (an `abilityOf` over any source, no `spell`). The
// exhaust is Ghalta, Stampede Tyrant's hand-to-battlefield choice over
// permanent cards (Aether Helix's `notTypes: ["instant", "sorcery"]`).

const MANA_TEXT =
  "{T}: Add X mana of any one color, where X is Redshift's power. Spend this mana only to activate abilities.";
const EXHAUST_TEXT =
  "Exhaust — {10}{R}{G}: Put any number of permanent cards from your hand onto the battlefield.";

export default defineCard({
  name: "Redshift, Rocketeer Chief",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Pilot"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${MANA_TEXT}\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { powerOf: "source" },
        spendOnly: { abilityOf: {}, abilityOfAnyZone: true, text: "Spend this mana only to activate abilities." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{10}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        // "Any number": clamped to the permanent cards actually in hand.
        max: 99,
        destination: "battlefield",
        leftover: "stay",
        filter: { notTypes: ["instant", "sorcery"] },
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
  ],
});
