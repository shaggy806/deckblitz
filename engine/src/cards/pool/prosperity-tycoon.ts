import { defineCard } from "../define.js";

// EDHREC rank 26362. "Sacrifice a token": any token, not only a creature.
const ENTER_TEXT =
  'When this creature enters, create a 1/1 red Mercenary creature token with "{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery."';
const SAC_TEXT = "{2}, Sacrifice a token: This creature gains indestructible until end of turn. Tap it.";

export default defineCard({
  name: "Prosperity Tycoon",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 4,
  toughness: 2,
  text: `${ENTER_TEXT}\n${SAC_TEXT} (Damage and effects that say "destroy" don't destroy it.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { token: true } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
          { kind: "tap", target: "source" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
