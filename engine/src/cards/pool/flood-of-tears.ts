import { defineCard } from "../define.js";

// EDHREC rank 4685.
//
// Rulings:
//   Any abilities that trigger as the nonland permanents are returned are put onto the stack at
//     the same time as any abilities that trigger as the permanent card is put onto the
//     battlefield (if applicable).
//   If a permanent would be returned to your hand but ends up in another zone (most likely
//     because an effect exiled it instead or because it's a player's commander in the Commander
//     variant) Flood of Tears counts it when determining whether four or more of your nontoken
//     permanents were returned.
//   If you return four or more nontoken permanents, the permanent card you put onto the
//     battlefield may be one of the cards returned to your hand this way.

export default defineCard({
  name: "Flood of Tears",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return all nonland permanents to their owners' hands. If you return four or more nontoken permanents you control this way, you may put a permanent card from your hand onto the battlefield.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand-all", filter: { notTypes: ["land"] } },
      {
        kind: "conditional",
        // Controlled as they left; a commander sent to the command zone
        // instead still counts (the ruling).
        condition: { kind: "this-way", what: "returned-to-hand", who: "you", filter: { token: false }, atLeast: 4 },
        then: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: 1,
          destination: "battlefield",
          leftover: "stay",
          filter: { notTypes: ["instant", "sorcery"] },
        },
      },
    ],
  },
});
