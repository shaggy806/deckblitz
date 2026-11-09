import { defineCard } from "../define.js";

const TEXT =
  "Whenever you tap an untapped creature an opponent controls, you may pay {1}. When you do, choose one —\n• Create a 4/4 white and blue Elemental creature token.\n• Put a +1/+1 counter on each creature you control.\n• Scry 2, then draw a card.";

// EDHREC rank 6788. Only an effect of yours tapping it counts (`by: "you"`,
// the ruling).
export default defineCard({
  name: "Hylda of the Icy Crown",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "opponent", filter: { type: "creature" }, by: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}? When you do, choose one: an Elemental token, a counter on each creature you control, or scry 2 then draw.",
        cost: "{1}",
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          text: "When you do, choose one —",
          effect: {
            kind: "modal",
            announced: true,
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: "Create a 4/4 white and blue Elemental creature token.", effect: { kind: "create-token", token: "4/4 White Blue Elemental Token", count: 1 } },
              {
                text: "Put a +1/+1 counter on each creature you control.",
                effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
              },
              { text: "Scry 2, then draw a card.", effect: { kind: "scry", amount: 2, then: { kind: "draw", amount: 1 } } },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
