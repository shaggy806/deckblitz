/**
 * Untapping other permanents as a cost (`AbilityCost.untapOthers`, rules
 * 701.26b, 602.2b, 601.2h) — Halo Fountain, Crackleburr.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, counters, hand, lands, life, named, pickPermanents, ref, settle, spawn, table, toLibrary, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;
const untapCost = (game: Game, source: ObjectId, index: number): boolean =>
  game.canDispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [] }) === null;

describe("Halo Fountain", () => {
  it("makes a Citizen for {W}, {T} and a tapped creature untapped, with no question when there's one", () => {
    const { game } = table();
    const fountain = spawn(game, "Halo Fountain");
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 1);
    activate(game, fountain, 0);
    expect(tapped(game, bear)).toBe(false);
    expect(tapped(game, fountain)).toBe(true);
    expect(named(game, "Citizen Token", A).length).toBe(1);
  });

  it("can't be activated with no tapped creature, nor counting an opponent's or a tapped land", () => {
    const { game } = table();
    const fountain = spawn(game, "Halo Fountain");
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Wastes", A, { tapped: true });
    lands(game, "Plains", 1);
    expect(untapCost(game, fountain, 0)).toBe(false);
  });

  it("asks which two as the cost is paid, before anyone gets priority, and untaps only those", () => {
    const { game, a } = table();
    const fountain = spawn(game, "Halo Fountain");
    const one = spawn(game, "Grizzly Bears", A, { tapped: true });
    const two = spawn(game, "Grizzly Bears", A, { tapped: true });
    const three = spawn(game, "Savannah Lions", A, { tapped: true });
    const opposing = spawn(game, "Savannah Lions", B, { tapped: true });
    toLibrary(game, "Wastes");
    const before = hand(game).length;
    lands(game, "Plains", 2);
    const seen = pickPermanents(a, one, three);
    activate(game, fountain, 1);
    expect([...seen.offered].sort()).toEqual([one, two, three].sort());
    expect(seen.offered).not.toContain(opposing);
    expect(tapped(game, one)).toBe(false);
    expect(tapped(game, three)).toBe(false);
    expect(tapped(game, two)).toBe(true);
    expect(hand(game).length).toBe(before + 1);
  });

  it("wants the full two: one tapped creature isn't enough", () => {
    const { game } = table();
    const fountain = spawn(game, "Halo Fountain");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 2);
    expect(untapCost(game, fountain, 0)).toBe(true);
    expect(untapCost(game, fountain, 1)).toBe(false);
  });

  it("wins the game with fifteen tapped creatures, and not fourteen", () => {
    const { game } = table();
    const fountain = spawn(game, "Halo Fountain");
    for (let i = 0; i < 14; i += 1) spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 5);
    expect(untapCost(game, fountain, 2)).toBe(false);
    spawn(game, "Grizzly Bears", A, { tapped: true });
    activate(game, fountain, 2);
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });

  it("can untap a creature tapped for the ability's own mana (its ruling)", () => {
    const { game, a } = table();
    const fountain = spawn(game, "Halo Fountain");
    const pilgrim = spawn(game, "Avacyn's Pilgrim", A);
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    // The mana ability first, the mana floating, keeping priority (rule 605.3).
    activate(game, pilgrim, 0, { settle: false });
    expect(tapped(game, pilgrim)).toBe(true);
    const seen = pickPermanents(a, pilgrim);
    activate(game, fountain, 0);
    expect([...seen.offered].sort()).toEqual([pilgrim, bear].sort());
    expect(tapped(game, pilgrim)).toBe(false);
    expect(tapped(game, bear)).toBe(true);
    expect(named(game, "Citizen Token", A).length).toBe(1);
  });

  it("is paid before anyone can respond: the ability is on the stack and the choice waits", () => {
    const { game } = table();
    const fountain = spawn(game, "Halo Fountain");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 1);
    activate(game, fountain, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("choose-permanents");
    if (game.state.awaiting?.kind === "choose-permanents") {
      expect(game.state.awaiting.priorityTo).toBe(A);
      expect(game.state.awaiting.player).toBe(A);
    }
    expect(game.state.zones.shared.stack.length).toBe(1);
  });

  it("can't untap a creature with a stun counter: the counter would replace it (rule 122.1d)", () => {
    const { game, a } = table();
    const fountain = spawn(game, "Halo Fountain");
    const stunned = spawn(game, "Grizzly Bears", A, { tapped: true });
    game.state.objects[stunned].counters.stun = 1;
    lands(game, "Plains", 1);
    expect(untapCost(game, fountain, 0)).toBe(false);
    const free = spawn(game, "Grizzly Bears", A, { tapped: true });
    const other = spawn(game, "Grizzly Bears", A, { tapped: true });
    const seen = pickPermanents(a, free);
    activate(game, fountain, 0);
    expect([...seen.offered].sort()).toEqual([free, other].sort());
    expect(counters(game, stunned, "stun")).toBe(1);
    expect(tapped(game, stunned)).toBe(true);
  });

  it("names a token stack's tokens one at a time, leaving the others tapped", () => {
    const { game, a } = table();
    const fountain = spawn(game, "Halo Fountain");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    const stack = spawn(game, "Citizen Token", A, { tapped: true });
    game.state.objects[stack].stackCount = 3;
    lands(game, "Plains", 2);
    pickPermanents(a, stack, stack);
    activate(game, fountain, 1);
    const citizens = named(game, "Citizen Token", A);
    const count = (want: boolean): number =>
      citizens.filter((id) => tapped(game, id) === want).reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(count(false)).toBe(2);
    expect(count(true)).toBe(1);
  });

  it("an animated Fountain can untap itself, its own {T} having tapped it (rule 601.2h)", () => {
    const { game } = table();
    const fountain = spawn(game, "Halo Fountain");
    const karn = spawn(game, "Karn, Silver Golem", A);
    lands(game, "Plains", 2);
    expect(untapCost(game, fountain, 0)).toBe(false);
    activate(game, karn, 0, { targets: [ref(fountain)] });
    settle(game);
    expect(untapCost(game, fountain, 0)).toBe(true);
    activate(game, fountain, 0);
    expect(tapped(game, fountain)).toBe(false);
    expect(named(game, "Citizen Token", A).length).toBe(1);
  });
});

describe("Crackleburr", () => {
  it("{Q} and two tapped blue creatures bounce a creature", () => {
    const { game } = table();
    const burr = spawn(game, "Crackleburr", A, { tapped: true });
    const merfolk = spawn(game, "Merfolk of the Pearl Trident", A, { tapped: true });
    const another = spawn(game, "Merfolk of the Pearl Trident", A, { tapped: true });
    const red = spawn(game, "Raging Goblin", A, { tapped: true });
    const victim = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    activate(game, burr, 1, { targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("hand");
    expect(tapped(game, burr)).toBe(false);
    expect(tapped(game, merfolk)).toBe(false);
    expect(tapped(game, another)).toBe(false);
    expect(tapped(game, red)).toBe(true);
  });

  it("{Q} can't also pay for one of the two: it's blue, but it untaps only once", () => {
    const { game } = table();
    const burr = spawn(game, "Crackleburr", A, { tapped: true });
    spawn(game, "Merfolk of the Pearl Trident", A, { tapped: true });
    const victim = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: burr, abilityIndex: 1, targets: [ref(victim)] }),
    ).toMatch(/too few tapped/);
  });

  it("{T} and two untapped red creatures deal 3 damage", () => {
    const { game } = table();
    const burr = spawn(game, "Crackleburr");
    const one = spawn(game, "Raging Goblin");
    const two = spawn(game, "Raging Goblin");
    lands(game, "Mountain", 2);
    activate(game, burr, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(life(game, A) - 3);
    expect(tapped(game, burr)).toBe(true);
    expect(tapped(game, one)).toBe(true);
    expect(tapped(game, two)).toBe(true);
  });
});
