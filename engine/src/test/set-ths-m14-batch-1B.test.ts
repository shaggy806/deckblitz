/**
 * Theros and Magic 2014, group B: Erebos's Emissary's discard pump, heroic
 * burn, Sea God's Revenge, a Sliver granting an attack trigger, Titan of
 * Eternal Fire's Human pingers, Celestial Flare in combat, Oath of the Ancient
 * Wood, Haunted Plate Mail's animation, Guardian of the Ages waking up,
 * Bubbling Cauldron's named sacrifice and Dragon Egg hatching.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Erebos's Emissary", () => {
  it("discarding a creature card gives it +2/+2", () => {
    const { game } = table();
    const emissary = spawn(game, "Erebos's Emissary");
    const bears = toHand(game, "Grizzly Bears");
    activate(game, emissary, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, emissary)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Labyrinth Champion", () => {
  it("a spell you cast targeting it makes it deal 2 damage to any target", () => {
    const { game, a } = table();
    const champion = spawn(game, "Labyrinth Champion");
    lands(game, "Forest", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(champion)] });
    expect(life(game, B)).toBe(18);
    expect(pt(game, champion)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Sea God's Revenge", () => {
  it("returns the chosen opponents' creatures to hand", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Llanowar Elves", B);
    const kept = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Sea God's Revenge"), { targets: [ref(one), ref(two), null] });
    expect([zone(game, one), zone(game, two), zone(game, kept)]).toEqual(["hand", "hand", "battlefield"]);
  });
});

describe("Thorncaster Sliver", () => {
  it("another Sliver you control pings as it attacks", () => {
    const { game, a } = table();
    spawn(game, "Thorncaster Sliver");
    const galerider = spawn(game, "Galerider Sliver");
    pickTargets(a, B);
    attack(game, a, [galerider]);
    // 1 from the granted trigger, 1 combat damage.
    expect(life(game, B)).toBe(18);
  });
});

describe("Titan of Eternal Fire", () => {
  it("a Human you control has {R}, {T}: 1 damage to any target", () => {
    const { game } = table();
    spawn(game, "Titan of Eternal Fire");
    const human = spawn(game, "Elite Vanguard");
    lands(game, "Mountain", 1);
    activate(game, human, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Celestial Flare", () => {
  it("the player sacrifices an attacking creature, not an idle one", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Plains", 2);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Celestial Flare"), { targets: [ref(A)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Oath of the Ancient Wood", () => {
  it("itself and each later enchantment you control may put a +1/+1 counter on a creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Oath of the Ancient Wood");
    expect(counters(game, bears)).toBe(1);
    enter(game, "Glorious Anthem");
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Haunted Plate Mail", () => {
  it("becomes a 4/4 Spirit artifact creature that's no longer an Equipment", () => {
    const { game } = table();
    const mail = spawn(game, "Haunted Plate Mail");
    activate(game, mail, 0);
    expect(pt(game, mail)).toEqual({ power: 4, toughness: 4 });
    expect([...types(game, mail)].sort()).toEqual(["artifact", "creature"]);
    expect(subtypes(game, mail)).toEqual(["Spirit"]);
  });

  it("can't animate while you control a creature", () => {
    const { game } = table();
    const mail = spawn(game, "Haunted Plate Mail");
    spawn(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "activate-ability", player: A, source: mail, abilityIndex: 0, targets: [] })).not.toBeNull();
  });
});

describe("Guardian of the Ages", () => {
  it("loses defender and gains trample when a creature attacks you", () => {
    const { game, b } = table();
    const guardian = spawn(game, "Guardian of the Ages");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(keywords(game, guardian).has("defender")).toBe(false);
    expect(keywords(game, guardian).has("trample")).toBe(true);
  });
});

describe("Bubbling Cauldron", () => {
  it("sacrificing any creature gains 4 life; the Newt ability won't take a non-Newt", () => {
    const { game } = table();
    const cauldron = spawn(game, "Bubbling Cauldron");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: cauldron, abilityIndex: 1, targets: [], sacrifice: bears }),
    ).not.toBeNull();
    game.dispatch({ type: "activate-ability", player: A, source: cauldron, abilityIndex: 0, targets: [], sacrifice: bears });
    nextTurn(game);
    expect(graveyard(game)).toContain(bears);
    expect(life(game, A)).toBe(24);
  });
});

describe("Dragon Egg", () => {
  it("dies into a 2/2 flying firebreathing Dragon", () => {
    const { game } = table();
    const egg = spawn(game, "Dragon Egg");
    destroy(game, egg);
    expect(tokensNamed(game, "Dragon Token (Firebreathing)", A)).toBe(1);
  });
});
