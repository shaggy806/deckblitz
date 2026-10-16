import { defineCard } from "../define.js";

// The Lost Caverns of Ixalan. A modal enters trigger (Coliseum Behemoth's
// shape): the mode, and its target, chosen as it goes on the stack.

export default defineCard({
  name: "Oltec Archaeologists",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Scout"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, choose one —\n• Return target artifact card from your graveyard to your hand.\n• Scry 3. (Look at the top three cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Return target artifact card from your graveyard to your hand.",
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "artifact" } }],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          { text: "Scry 3.", effect: { kind: "scry", amount: 3 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
