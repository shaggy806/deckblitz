import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, counter target activated or triggered ability from an artifact or enchantment source. If a permanent's ability is countered this way, destroy that permanent.";

export default defineCard({
  name: "Green Slime",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  foretell: { cost: "{G}" },
  text: `Flash\n${ETB_TEXT}\nForetell {G} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "ability", sourceTypes: ["artifact", "enchantment"] }],
      effect: { kind: "counter", target: 0, thenSource: { effect: { kind: "destroy", target: 0 } } },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
