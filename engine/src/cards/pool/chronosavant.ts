import { defineCard } from "../define.js";

const RETURN_TEXT = "{1}{W}: Return this card from your graveyard to the battlefield tapped. You skip your next turn.";

/** Activated again in response, each resolution still skips a turn (its
 * ruling): the `skip-turn` doesn't depend on the return. */
export default defineCard({
  name: "Chronosavant",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 5,
  toughness: 5,
  text: RETURN_TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "source", enterTapped: true },
          { kind: "skip-turn", who: "you" },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
