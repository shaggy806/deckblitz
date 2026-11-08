import { defineCard } from "../define.js";

// Aetherdrift. "A spell they don't own" is read from the spell's
// side (`notOwnedByController`): its caster controls it (rule 601.2a). The
// second ability is Edric, Spymaster of Trest's trigger, done by the
// creature's controller (`as-player`): they look, exile and may play it, as
// Gonti, Canny Acquisitor's face-down exile.
const CAST_TEXT = "Whenever a player casts a spell they don't own, that player creates a Treasure token.";
const DAMAGE_TEXT =
  "Whenever a creature deals combat damage to one of your opponents, its controller looks at the top card of that opponent's library and exiles it face down. They may play that card for as long as it remains exiled. Mana of any type can be spent to cast a spell this way.";

export default defineCard({
  name: "Gonti, Night Minister",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Aetherborn", "Rogue"],
  power: 3,
  toughness: 4,
  text: `${CAST_TEXT}\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { notOwnedByController: true } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1, who: "trigger-controller" },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { type: "creature" }, toOpponent: true },
      targets: [],
      effect: {
        kind: "as-player",
        who: "trigger-controller",
        effect: {
          kind: "impulse-exile",
          amount: 1,
          whose: "trigger-player",
          duration: "while-exiled",
          faceDown: true,
          spendAs: "any-type",
          play: true,
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
