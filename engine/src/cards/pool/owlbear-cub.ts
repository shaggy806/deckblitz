import { defineCard } from "../define.js";

// The attack is read as it's declared, so eight lands on the attacked player's
// side then is what fires it (a trigger condition, rule 603.2); the creature put
// in attacks that same player.

const TEXT = "Mama's Coming — Whenever this creature attacks a player who controls eight or more lands, look at the top eight cards of your library. You may put a creature card from among them onto the battlefield tapped and attacking that player. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Owlbear Cub",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Bird", "Bear"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "of-player",
        player: "defending-player",
        condition: { kind: "controls", filter: { type: "land" }, atLeast: 8 },
      },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 8,
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        enterTapped: true,
        attacking: { player: "trigger-player" },
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
