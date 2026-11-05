import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// The player is chosen as the ability resolves, among those with the most life
// then, and it's that player's creatures from then on, whenever they arrived and
// whatever the life totals do after (the rulings): `as-player` fixes "you" of the
// restriction to them as it resolves, so a second activation choosing someone
// else leaves this one alone.

const ENTERS = "As The Black Gate enters, you may pay 3 life. If you don't, it enters tapped.";
const SHADOW =
  "{1}{B}, {T}: Choose a player with the most life or tied for most life. Target creature can't be blocked by creatures that player controls this turn.";

export default defineCard({
  name: "The Black Gate",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  subtypes: ["Gate"],
  text: `${ENTERS}\n{T}: Add {B}.\n${SHADOW}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", mayPayLife: 3 },
      text: ENTERS,
    },
  ],
  activated: [
    manaTapAbility("B"),
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "choose-opponent",
        anyPlayer: true,
        mostLife: true,
        then: {
          kind: "as-player",
          who: "that-player",
          effect: {
            kind: "restrict",
            target: 0,
            restrictions: [],
            cantBeBlockedBy: { type: "creature", controlledBy: "you" },
          },
        },
      },
      resolve: null,
      text: SHADOW,
    },
  ],
});
