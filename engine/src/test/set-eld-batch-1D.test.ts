/**
 * Throne of Eldraine (ELD) — group D of the set walk: Adventures, a second-draw
 * trigger, Food, and the Auras that hold a creature down.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Irencrag Pyromancer", () => {
  it("deals 3 damage on the second card drawn in a turn, and only then", () => {
    const { game, a } = table();
    spawn(game, "Irencrag Pyromancer");
    pickTargets(a, B);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(life(game, B)).toBe(17);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(life(game, B)).toBe(17);
  });
});

describe("Smitten Swordmaster // Curry Favor", () => {
  it("Curry Favor drains for each Knight you control, then the card waits in exile", () => {
    const { game } = table();
    spawn(game, "Smitten Swordmaster");
    spawn(game, "Steelclaw Lance"); // not a Knight
    lands(game, "Swamp", 1);
    const card = toHand(game, "Smitten Swordmaster");
    cast(game, card, { face: 1 });
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(19);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Flaxen Intruder", () => {
  it("may be sacrificed after combat damage to destroy an artifact", () => {
    const { game, a } = table();
    const intruder = spawn(game, "Flaxen Intruder");
    const casket = spawn(game, "Glass Casket", B);
    pickModes(a, 0);
    pickTargets(a, casket);
    attack(game, a, [intruder]);
    expect(zone(game, intruder)).toBe("graveyard");
    expect(zone(game, casket)).toBe("graveyard");
  });

  it("Welcome Home makes three Bears", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    cast(game, toHand(game, "Flaxen Intruder"), { face: 1 });
    expect(tokensNamed(game, "Bear Token", A)).toBe(3);
  });
});

describe("Gluttonous Troll", () => {
  it("makes a Food per opponent and can't sacrifice itself to its own pump", () => {
    const { game } = table({ players: 3 });
    const troll = enter(game, "Gluttonous Troll");
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    lands(game, "Forest", 2);
    const forest = named(game, "Forest", A)[0];
    const food = named(game, "Food Token", A)[0];
    const base = { type: "activate-ability", player: A, source: troll, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch({ ...base, sacrifice: troll })).not.toBeNull();
    expect(game.canDispatch({ ...base, sacrifice: forest })).not.toBeNull();
    game.dispatch({ ...base, sacrifice: food });
    settle(game);
    expect(pt(game, troll)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Glass Casket", () => {
  it("exiles an opponent's small creature until it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const casket = enter(game, "Glass Casket");
    expect(zone(game, bears)).toBe("exile");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(casket)]);
    settle(game);
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Flutterfox", () => {
  it("flies only while you control an artifact or enchantment", () => {
    const { game } = table();
    const fox = spawn(game, "Flutterfox");
    expect(keywords(game, fox).has("flying")).toBe(false);
    spawn(game, "Glass Casket");
    expect(keywords(game, fox).has("flying")).toBe(true);
  });
});

describe("Tall as a Beanstalk", () => {
  it("makes the enchanted creature a 5/5 Giant with reach", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Tall as a Beanstalk"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Giant"]));
  });
});

describe("Steelclaw Lance", () => {
  it("equips a Knight for {1}, but not a non-Knight", () => {
    const { game } = table();
    const lance = spawn(game, "Steelclaw Lance");
    const knight = spawn(game, "Smitten Swordmaster");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1);
    expect(() => activate(game, lance, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, lance, 0, { targets: [ref(knight)] });
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Stay Hidden, Stay Silent", () => {
  it("taps the creature, then shuffles it away and manifests dread", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 8);
    const aura = toHand(game, "Stay Hidden, Stay Silent");
    cast(game, aura, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    const faceDown = (): number => game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined).length;
    expect(faceDown()).toBe(0);
    activate(game, aura);
    expect(zone(game, bears)).toBe("library");
    expect(faceDown()).toBe(1);
  });
});
