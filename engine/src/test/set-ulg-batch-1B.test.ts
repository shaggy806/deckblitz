/**
 * Urza's Legacy (ULG) and Portal Three Kingdoms (PTK) — group B.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Angel's Trumpet", () => {
  it("taps the end-step player's creatures that didn't attack and deals that much damage to them", () => {
    const { game, a } = table();
    spawn(game, "Angel's Trumpet");
    const attacker = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Grizzly Bears");
    const alreadyTapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    attack(game, a, [attacker]);
    // Vigilance: the attacker didn't tap.
    expect(game.state.objects[attacker].tapped).toBe(false);
    expect(life(game, B)).toBe(18);
    nextTurn(game); // through alice's end step
    expect(game.state.objects[idle].tapped).toBe(true);
    expect(game.state.objects[attacker].tapped).toBe(false);
    expect(game.state.objects[alreadyTapped].tapped).toBe(true);
    // Only the one creature tapped this way counts.
    expect(life(game, A)).toBe(19);
  });
});

describe("Last-Ditch Effort", () => {
  it("sacrifices the creatures chosen on resolution and deals that much damage to the target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, mine[0], mine[1]);
    cast(game, toHand(game, "Last-Ditch Effort"), { targets: [ref(B)] });
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, mine[0])).toBe("graveyard");
    expect(zone(game, mine[1])).toBe("graveyard");
    expect(zone(game, mine[2])).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });
});

describe("Granite Grip and Devout Harpist", () => {
  it("counts the Aura controller's Mountains; the Harpist destroys an Aura on a creature", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Mountain", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Granite Grip"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 2 });
    const grip = named(game, "Granite Grip")[0];
    const harpist = spawn(game, "Devout Harpist");
    activate(game, harpist, 0, { targets: [ref(grip)] });
    expect(zone(game, grip)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Goblin Medics", () => {
  it("deals 1 damage to any target when it taps to attack", () => {
    const { game, a } = table();
    const medics = spawn(game, "Goblin Medics");
    pickTargets(a, B);
    attack(game, a, [medics]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Aura Flux", () => {
  it("gives other enchantments an upkeep cost their controller sacrifices them for not paying", () => {
    const { game } = table();
    const flux = spawn(game, "Aura Flux");
    const mine = spawn(game, "Glorious Anthem");
    const theirs = spawn(game, "Glorious Anthem", B);
    nextTurn(game); // bob's upkeep: only bob's enchantment's ability fires
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, flux)).toBe("battlefield");
  });
});

describe("Thran Weaponry", () => {
  it("gives every creature +2/+2 while it stays tapped", () => {
    const { game } = table();
    const weaponry = spawn(game, "Thran Weaponry");
    lands(game, "Wastes", 2);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, weaponry, 0);
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game); // bob's turn: still tapped
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(weaponry)]);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Tethered Skirge", () => {
  it("its controller loses 1 life when it becomes a target", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const skirge = spawn(game, "Tethered Skirge");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(skirge)] });
    expect(life(game, A)).toBe(19);
    expect(pt(game, skirge)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Cao Cao, Lord of Wei", () => {
  it("makes the target opponent discard two, only on your turn before attackers", () => {
    const { game } = table();
    const cao = spawn(game, "Cao Cao, Lord of Wei");
    toStep(game, "postcombat-main");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: cao, abilityIndex: 0, targets: [ref(B)] }),
    ).not.toBeNull();
    nextTurn(game);
    nextTurn(game);
    const before = hand(game, B).length;
    activate(game, cao, 0, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
  });
});
