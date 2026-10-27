/**
 * Onslaught (ONS) — batch 2, group D.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Onslaught batch 2D", () => {
  it("Commando Raid: on its hit, the creature deals its power to a creature that player controls", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const victim = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Commando Raid"), { targets: [ref(bears)] });
    pickTargets(a, victim);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("Haunted Cadaver: sacrificing it on its hit makes that player discard three", () => {
    const { game, a } = table();
    const cadaver = spawn(game, "Haunted Cadaver");
    const before = hand(game, B).length;
    pickModes(a, 0);
    attack(game, a, [cadaver]);
    expect(zone(game, cadaver)).toBe("graveyard");
    expect(hand(game, B).length).toBe(before - 3);
  });

  it("Frightshroud Courier: a Zombie only, +2/+2 and fear only while the Courier stays tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const courier = spawn(game, "Frightshroud Courier");
    const zombie = spawn(game, "Haunted Cadaver");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, courier, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, courier, 0, { targets: [ref(zombie)] });
    expect(pt(game, zombie)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, zombie).has("fear")).toBe(true);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(courier)]);
    settle(game);
    expect(pt(game, zombie)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, zombie).has("fear")).toBe(false);
  });

  it("Nosy Goblin destroys a face-down creature, and can't target a face-up one", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const morph = toHand(game, "Cabal Executioner");
    cast(game, morph, { via: "face-down" });
    expect(game.state.objects[morph].faceDown?.kind).toBe("morph");
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Nosy Goblin");
    expect(() => activate(game, goblin, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, goblin, 0, { targets: [ref(morph)] });
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, morph)).toBe("graveyard");
  });

  it("Riptide Biologist: a Beast's damage to it is prevented", () => {
    const { game, a, b } = table();
    const bruiser = spawn(game, "Shaleskin Bruiser");
    const biologist = spawn(game, "Riptide Biologist", B);
    b.declareBlockersFn = () => [{ blocker: biologist, attacker: bruiser }];
    attack(game, a, [bruiser]);
    expect(zone(game, biologist)).toBe("battlefield");
    expect(game.state.objects[biologist].damageMarked).toBe(0);
  });

  it("Convalescent Care: at 5 or less life, gain 3 and draw at upkeep", () => {
    const { game } = table();
    spawn(game, "Convalescent Care");
    game.state.players[A].life = 5;
    const before = hand(game).length;
    toStep(game, "upkeep");
    settle(game);
    expect(life(game)).toBe(8);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Convalescent Care does nothing above 5 life", () => {
    const { game } = table();
    spawn(game, "Convalescent Care");
    game.state.players[A].life = 6;
    const before = hand(game).length;
    toStep(game, "upkeep");
    settle(game);
    expect(life(game)).toBe(6);
    expect(hand(game).length).toBe(before);
  });

  it("Invigorating Boon: an opponent's cycling still lets you put a counter on target creature", () => {
    const { game, a } = table();
    spawn(game, "Invigorating Boon");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 1, B);
    const moor = toHand(game, "Barren Moor", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    // Bob cycles on his own priority: hand it to him by passing.
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "cycle", player: B, card: moor });
    game.advanceUntil(quiet);
    expect(counters(game, bears)).toBe(1);
  });
});
