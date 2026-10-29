import { defineCard } from "../define.js";

// EDHREC rank 31191.
// Rulings:
//   [2004-10-04] Can redirect damage from combat and from abilities, but the creature must be
//     attacking before you can use this card's ability.
//
// Combat and noncombat damage alike; the same source deals it to this
// creature instead (rule 614.9), and nothing is redirected while this isn't
// on the battlefield.

const TEXT =
  "{B}, {T}: All damage that would be dealt to you this turn by target attacking creature is dealt to this creature instead.";

export default defineCard({
  name: "Shimian Night Stalker",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightstalker"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{B}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: { kind: "damage-rule", to: { players: "you" }, by: { target: 0 }, redirectTo: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
