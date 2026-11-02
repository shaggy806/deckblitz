/**
 * Damage whose source is another object than the effect's own (rule 120.1): the
 * creature an Aura enchants (Bind the Monster, Dizzying Gaze, Pain for All,
 * Consuming Ferocity), each Aura to its own host (Aura Barbs), the token just
 * created (Chainer's Torment), a card just exiled (Selfless Exorcist), and the
 * card just put onto the battlefield (Vivien's Invocation).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, cast, counters, destroy, grant, lands, life, named, nextTurn, pickFromZone, pickTargets, ref, settle, spawn, table, toExile, toGraveyard, toHand, toLibrary, toStep, watchTargets, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
const emptyLibraryTop = (game: Game, player: PlayerId, names: readonly string[]): ObjectId[] => names.map((n) => toLibrary(game, n, player));

describe("the enchanted creature as the source", () => {
  it("Bind the Monster: taps it, it deals you its power, and it stays tapped", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bind = toHand(game, "Bind the Monster", A);
    lands(game, "Island", 1);
    pickTargets(a, giant);
    cast(game, bind, { targets: [ref(giant)] });
    expect(life(game, A)).toBe(17);
    expect(game.state.objects[giant].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("Bind the Monster: the creature's lifelink is its controller's", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    grant(game, giant, "lifelink");
    const bind = toHand(game, "Bind the Monster", A);
    lands(game, "Island", 1);
    cast(game, bind, { targets: [ref(giant)] });
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(23);
  });

  it("Dizzying Gaze: deals 1 from the enchanted creature to a flyer only", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const flyer = spawn(game, "Serra Angel", B);
    const ground = spawn(game, "Hill Giant", B);
    const gaze = toHand(game, "Dizzying Gaze", A);
    lands(game, "Mountain", 2);
    cast(game, gaze, { targets: [ref(bear)] });
    expect(game.state.objects[gaze].attachedTo).toBe(bear);
    expect(() => activate(game, gaze, 0, { targets: [ref(ground)] })).toThrow();
    grant(game, bear, "deathtouch");
    activate(game, gaze, 0, { targets: [ref(flyer)] });
    // Deathtouch is the Bears', so the damage is theirs.
    expect(zone(game, flyer)).toBe("graveyard");
  });

  it("Dizzying Gaze: only on a creature you control", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const gaze = toHand(game, "Dizzying Gaze", A);
    lands(game, "Mountain", 1);
    expect(() => cast(game, gaze, { targets: [ref(theirs)] })).toThrow();
  });

  it("Pain for All: its power to any target but itself", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", A);
    const pain = toHand(game, "Pain for All", A);
    lands(game, "Mountain", 3);
    const seen = watchTargets(a, () => [B]);
    cast(game, pain, { targets: [ref(giant)] });
    expect(life(game, B)).toBe(17);
    expect(damageOn(game, giant)).toBe(0);
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).toContain(B);
  });

  it("Pain for All: dealt damage, the creature deals that much to each opponent, once for one event", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant", A);
    const pain = toHand(game, "Pain for All", A);
    lands(game, "Mountain", 4);
    pickTargets(a, B);
    cast(game, pain, { targets: [ref(giant)] });
    const shock = toHand(game, "Shock", A);
    pickTargets(a);
    cast(game, shock, { targets: [ref(giant)] });
    expect(damageOn(game, giant)).toBe(2);
    expect(life(game, B)).toBe(15);
    expect(life(game, C)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("Pain for All: lethal damage still triggers, the creature read as it last was", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const pain = toHand(game, "Pain for All", A);
    lands(game, "Mountain", 5);
    pickTargets(a, B);
    cast(game, pain, { targets: [ref(bear)] });
    const before = life(game, B);
    const blast = toHand(game, "Lightning Bolt", A);
    cast(game, blast, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(life(game, B)).toBe(before - 3);
  });

  it("Consuming Ferocity: two upkeeps grow it; at the third counter it hits its controller and is destroyed for good", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const ferocity = toHand(game, "Consuming Ferocity", A);
    lands(game, "Mountain", 2);
    cast(game, ferocity, { targets: [ref(bear)] });
    const eachUpkeep = (): void => {
      nextTurn(game);
      toStep(game, "precombat-main", A);
    };
    eachUpkeep();
    expect(counters(game, bear, "+1/+0")).toBe(1);
    eachUpkeep();
    expect(counters(game, bear, "+1/+0")).toBe(2);
    expect(life(game, B)).toBe(20);
    eachUpkeep();
    // 2 printed, +1 from the Aura, +3 from the counters: 6 to Bob, not Alice.
    expect(life(game, B)).toBe(14);
    expect(life(game, A)).toBe(20);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, ferocity)).toBe("graveyard");
  });

  it("Consuming Ferocity can't enchant a Wall", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Stone", B);
    const ferocity = toHand(game, "Consuming Ferocity", A);
    lands(game, "Mountain", 2);
    expect(() => cast(game, ferocity, { targets: [ref(wall)] })).toThrow();
  });
});

describe("Aura Barbs — each enchantment a source of its own", () => {
  it("each enchantment 2 to its controller, then each Aura on a creature 2 to that creature", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bind = toHand(game, "Bind the Monster", A);
    lands(game, "Island", 1);
    cast(game, bind, { targets: [ref(giant)] }); // Alice takes 3
    spawn(game, "Rest in Peace", B);
    const barbs = toHand(game, "Aura Barbs", A);
    lands(game, "Mountain", 3);
    cast(game, barbs);
    // Alice's Aura hits her, Bob's enchantment him; the Aura hits its Giant.
    expect(life(game, A)).toBe(15);
    expect(life(game, B)).toBe(18);
    expect(damageOn(game, giant)).toBe(2);
  });

  it("an Aura on nothing but a player's enchantment deals nothing to a creature", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Rest in Peace", A);
    const barbs = toHand(game, "Aura Barbs", A);
    lands(game, "Mountain", 3);
    cast(game, barbs);
    expect(life(game, A)).toBe(18);
    expect(damageOn(game, giant)).toBe(0);
  });

  it("dealt by the Aura, not by the creature: the creature's lifelink gains nothing", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bind = toHand(game, "Bind the Monster", A);
    lands(game, "Island", 1);
    cast(game, bind, { targets: [ref(giant)] });
    const before = life(game, A);
    // Dealt by the Aura (its ruling), so the creature's own lifelink doesn't apply.
    grant(game, giant, "lifelink");
    const barbs = toHand(game, "Aura Barbs", A);
    lands(game, "Mountain", 3);
    cast(game, barbs);
    expect(life(game, A)).toBe(before - 2);
    expect(life(game, B)).toBe(20);
    expect(damageOn(game, giant)).toBe(2);
  });
});

describe("Chainer's Torment — the token just created as the source", () => {
  it("I and II drain 2; III makes an X/X and it deals X to you, X half your life rounded up", () => {
    const { game } = table({ life: 21 });
    const saga = toHand(game, "Chainer's Torment", A);
    lands(game, "Swamp", 4);
    cast(game, saga);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(23);
    nextTurn(game);
    toStep(game, "precombat-main", A);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(25);
    nextTurn(game);
    toStep(game, "precombat-main", A);
    settle(game);
    const [horror] = named(game, "Nightmare Horror Token");
    // Half of 25, rounded up, is 13: the token is 13/13 and Alice is at 12.
    expect(game.state.objects[horror].controller).toBe(A);
    expect(life(game, A)).toBe(12);
    expect(life(game, B)).toBe(17);
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("each token an Anointed Procession doubles deals the same X", () => {
    const { game } = table({ life: 21 });
    spawn(game, "Anointed Procession", A);
    const saga = toHand(game, "Chainer's Torment", A);
    lands(game, "Swamp", 4);
    cast(game, saga);
    nextTurn(game);
    toStep(game, "precombat-main", A);
    nextTurn(game);
    toStep(game, "precombat-main", A);
    settle(game);
    // Two tokens, each dealing X = 13 from 25: 25 - 26, and Alice loses.
    expect(game.state.players[A].hasLost).toBe(true);
  });
});

describe("Selfless Exorcist — a card in exile as the source", () => {
  it("exiles the card and it deals its power to the Exorcist", () => {
    const { game } = table();
    const exorcist = spawn(game, "Selfless Exorcist", A);
    const card = toGraveyard(game, "Hill Giant", B);
    activate(game, exorcist, 0, { targets: [ref(card)] });
    expect(zone(game, card)).toBe("exile");
    expect(damageOn(game, exorcist)).toBe(3);
  });

  it("the source's power is the card's own in exile, and a big one kills", () => {
    const { game } = table();
    const exorcist = spawn(game, "Selfless Exorcist", A);
    const card = toGraveyard(game, "Serra Angel", B);
    const big = toGraveyard(game, "Colossal Dreadmaw", B);
    activate(game, exorcist, 0, { targets: [ref(big)] });
    expect(zone(game, exorcist)).toBe("graveyard");
    expect(zone(game, big)).toBe("exile");
    expect(zone(game, card)).toBe("graveyard");
  });

  it("can't target anything but a creature card in a graveyard", () => {
    const { game } = table();
    const exorcist = spawn(game, "Selfless Exorcist", A);
    const spell = toGraveyard(game, "Divination", B);
    const exiled = toExile(game, "Hill Giant", B);
    expect(() => activate(game, exorcist, 0, { targets: [ref(spell)] })).toThrow();
    expect(() => activate(game, exorcist, 0, { targets: [ref(exiled)] })).toThrow();
  });
});

describe("Vivien's Invocation — the card put onto the battlefield as the source", () => {
  const withTop = () => {
    const t = table();
    // `toLibrary` puts each on top, so the last is the top card.
    emptyLibraryTop(t.game, A, ["Island", "Island", "Island", "Island", "Island", "Island"]);
    const giant = toLibrary(t.game, "Hill Giant", A);
    const invocation = toHand(t.game, "Vivien's Invocation", A);
    lands(t.game, "Forest", 7);
    return { ...t, giant, invocation };
  };

  it("the creature put deals its power to a creature an opponent controls, as a trigger after the sorcery", () => {
    const { game, a, giant, invocation } = withTop();
    const foe = spawn(game, "Serra Angel", B);
    const pick = pickFromZone(a, giant);
    pickTargets(a, foe);
    cast(game, invocation);
    expect(pick.offered).toContain(giant);
    expect(zone(game, giant)).toBe("battlefield");
    expect(damageOn(game, foe)).toBe(3);
    expect(game.state.objects[giant].controller).toBe(A);
    expect(zone(game, invocation)).toBe("graveyard");
  });

  it("nothing put, nothing triggers, and the rest go to the bottom", () => {
    const { game, a, giant, invocation } = withTop();
    const foe = spawn(game, "Serra Angel", B);
    pickFromZone(a);
    cast(game, invocation);
    expect(zone(game, giant)).toBe("library");
    expect(damageOn(game, foe)).toBe(0);
    expect(game.state.zones.perPlayer[A].library[0]).not.toBe(giant);
  });

  it("with no creature of an opponent's, the put still happens and the trigger has no target", () => {
    const { game, a, giant, invocation } = withTop();
    pickFromZone(a, giant);
    cast(game, invocation);
    expect(zone(game, giant)).toBe("battlefield");
    expect(damageOn(game, giant)).toBe(0);
  });

  it("a source destroyed in response is read as it last was", () => {
    const { game, a, giant, invocation } = withTop();
    const foe = spawn(game, "Serra Angel", B);
    const shock = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    pickFromZone(a, giant);
    pickTargets(a, foe);
    cast(game, invocation, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    game.dispatch({ type: "pass-priority", player: B });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder === A && s.zones.shared.battlefield.includes(giant));
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, shock, { player: B, targets: [ref(giant)], settle: false });
    destroy(game, giant);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(damageOn(game, foe)).toBe(3);
  });
});
