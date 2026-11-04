import { defineCard } from "../define.js";

// Rulings:
//   [2004-10-04] At the beginning of the resolution, each player counts up the number of creatures
//     they control, then they make the required number of payments and/or sacrifices. The active
//     player announces their choices first followed by the other players, but all the sacrifices
//     are done at the same time. Because of this, you can't sacrifice one creature in order to pay
//     for another and thereby avoid payment for the first.
//   [2004-10-04] You can choose to pay some mana and sacrifice some permanents if you have more
//     than one creature.
//   [2004-10-04] You can activate mana abilities during the resolution if you decide to pay mana.

export default defineCard({
  name: "Fade Away",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "For each creature, its controller sacrifices a permanent of their choice unless they pay {1}.",
  effect: {
    kind: "for-each-unless",
    of: { permanents: { type: "creature" } },
    asks: "controller",
    options: [{ pay: "{1}", text: "Pay {1} for {it}" }],
    otherwise: { kind: "sacrifice", who: "that-player", filter: {}, count: 1 },
  },
});
