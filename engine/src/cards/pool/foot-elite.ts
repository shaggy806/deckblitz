import { defineCard } from "../define.js";

// EDHREC rank 17606.


const ATTACK_TEXT =
  "Whenever this creature attacks, another target creature you control gets +1/+0 and gains indestructible until end of turn.";

// Oliphaunt's "another target creature you control", with Masterful
// Flourish's pump.
export default defineCard({
  name: "Foot Elite",
  manaCost: "{2}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Ninja"],
  power: 2,
  toughness: 4,
  text: `${ATTACK_TEXT} (Damage and effects that say "destroy" don't destroy it.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
