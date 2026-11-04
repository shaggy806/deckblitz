/**
 * "Then if you control eight or more artifacts with the same name as one
 * another, you win the game": `win-game` behind `controls`' `sharingAName`,
 * read after the token is made, with a copy of the enchanted artifact each
 * upkeep.
 *
 * Proving card: Mechanized Production.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, named, ref, settle, spawn, table, toHand, toStep, type Table, zone } from "./harness.js";

const PRODUCTION = "Mechanized Production";
const RING = "Sol Ring";

/** Alice has a Mechanized Production on a new artifact of hers, cast for real. */
function enchanted(t: Table, on: string): { host: ObjectId; aura: ObjectId } {
  const host = spawn(t.game, on);
  lands(t.game, "Island", 4);
  const aura = toHand(t.game, PRODUCTION);
  cast(t.game, aura, { targets: [ref(host)] });
  expect(zone(t.game, aura)).toBe("battlefield");
  expect(t.game.state.objects[aura].attachedTo).toBe(host);
  return { host, aura };
}

const won = (game: Game): boolean => game.winner === A;

describe("Mechanized Production", () => {
  it("copies the enchanted artifact at the beginning of your upkeep, the token its controller's", () => {
    const t = table();
    enchanted(t, RING);
    expect(named(t.game, RING, A)).toHaveLength(1);
    toStep(t.game, "upkeep");
    settle(t.game);
    const rings = named(t.game, RING, A);
    expect(rings).toHaveLength(2);
    expect(rings.filter((id) => t.game.state.objects[id].isToken === true)).toHaveLength(1);
    expect(won(t.game)).toBe(false);
  });

  it("doesn't trigger in another player's upkeep", () => {
    const t = table();
    enchanted(t, RING);
    toStep(t.game, "upkeep", B);
    settle(t.game);
    expect(named(t.game, RING, A)).toHaveLength(1);
  });

  it("wins as the eighth comes: the token counts, since it's read after", () => {
    const t = table();
    enchanted(t, RING);
    for (let i = 0; i < 6; i += 1) spawn(t.game, RING);
    expect(named(t.game, RING, A)).toHaveLength(7);
    toStep(t.game, "upkeep");
    settle(t.game);
    expect(named(t.game, RING, A)).toHaveLength(8);
    expect(won(t.game)).toBe(true);
  });

  it("not with seven: the first turn's token makes only seven of eight", () => {
    const t = table();
    enchanted(t, RING);
    for (let i = 0; i < 5; i += 1) spawn(t.game, RING);
    toStep(t.game, "upkeep");
    settle(t.game);
    expect(named(t.game, RING, A)).toHaveLength(7);
    expect(won(t.game)).toBe(false);
  });

  it("the eight needn't be namesakes of the enchanted artifact (the rulings)", () => {
    const t = table();
    enchanted(t, RING);
    for (let i = 0; i < 8; i += 1) spawn(t.game, "Mind Stone");
    toStep(t.game, "upkeep");
    settle(t.game);
    expect(won(t.game)).toBe(true);
  });

  it("a stack of tokens counts as every token in it", () => {
    const t = table();
    enchanted(t, RING);
    t.game.debugApplyEffect(A, { kind: "create-token", token: "Thopter Token", count: 8 });
    const stack = named(t.game, "Thopter Token", A)[0];
    expect(t.game.state.objects[stack].stackCount).toBe(8);
    toStep(t.game, "upkeep");
    settle(t.game);
    expect(won(t.game)).toBe(true);
  });

  it("all eight must be artifacts, and yours (the rulings)", () => {
    const t = table();
    enchanted(t, RING);
    // Eight of one name that aren't artifacts, and an opponent's eight.
    for (let i = 0; i < 8; i += 1) spawn(t.game, "Grizzly Bears");
    for (let i = 0; i < 8; i += 1) spawn(t.game, "Mind Stone", B);
    toStep(t.game, "upkeep");
    settle(t.game);
    expect(won(t.game)).toBe(false);
  });

  it("is checked only on resolution: eight on the board with the host gone in response, still reads as it resolves", () => {
    const t = table();
    const { host } = enchanted(t, RING);
    for (let i = 0; i < 8; i += 1) spawn(t.game, "Mind Stone");
    lands(t.game, "Mountain", 2);
    const shatter = toHand(t.game, "Shatter");
    // Eight already there aren't a win until the ability resolves (the rulings).
    expect(won(t.game)).toBe(false);
    toStep(t.game, "upkeep");
    expect(won(t.game)).toBe(false);
    // Host gone: the Aura goes as a state-based action. The ability still
    // resolves, and with no enchanted artifact it's read as it last existed.
    cast(t.game, shatter, { targets: [ref(host)] });
    expect(zone(t.game, host)).toBe("graveyard");
    expect(won(t.game)).toBe(true);
  });

  it("falls off when another player gains control of the artifact (rule 704.5m)", () => {
    const t = table();
    const { host, aura } = enchanted(t, RING);
    t.game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(host)]);
    toStep(t.game, "begin-combat");
    expect(zone(t.game, aura)).toBe("graveyard");
  });

  it("can only be cast on an artifact you control", () => {
    const t = table();
    const theirs = spawn(t.game, RING, B);
    const bear = spawn(t.game, "Grizzly Bears");
    lands(t.game, "Island", 4);
    const aura = toHand(t.game, PRODUCTION);
    expect(() => cast(t.game, aura, { targets: [ref(theirs)] })).toThrow(/refused/);
    expect(() => cast(t.game, aura, { targets: [ref(bear)] })).toThrow(/refused/);
  });

  it("doesn't win for a player who can't (Platinum Angel's rule, 104.2b)", () => {
    const t = table();
    enchanted(t, RING);
    for (let i = 0; i < 8; i += 1) spawn(t.game, "Mind Stone");
    spawn(t.game, "Platinum Angel", B);
    toStep(t.game, "upkeep");
    settle(t.game);
    expect(won(t.game)).toBe(false);
  });
});
